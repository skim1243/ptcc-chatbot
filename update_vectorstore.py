import os
import logging
from google.cloud import storage
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from firebase_functions import https_fn
from firebase_admin import initialize_app

logging.basicConfig(level=logging.INFO)

# --- Configuration ---
# GCS Buckets
PDF_BUCKET_NAME = "your-source-pdf-bucket-name"  # Bucket with your PDF files
CHROMA_BUCKET_NAME = "your-chroma-db-bucket-name" # Bucket to store the Chroma DB

# Local paths within the Cloud Function's temporary filesystem
LOCAL_DB_PATH = "/tmp/chroma_db"
LOCAL_PDF_PATH = "/tmp/pdfs"

# LangChain settings
EMBEDDING_MODEL = "sentence-transformers/all-mpnet-base-v2"

# --- Initialization ---
initialize_app()
storage_client = storage.Client()

# --- GCS Helper Functions ---

def download_directory_from_gcs(bucket_name, gcs_folder, local_path):
    """Downloads a directory from GCS to a local path."""
    if os.path.exists(local_path):
        return # Already exists
    os.makedirs(local_path, exist_ok=True)
    bucket = storage_client.bucket(bucket_name)
    blobs = bucket.list_blobs(prefix=gcs_folder)
    for blob in blobs:
        # Create nested directories if they don't exist
        local_file_path = os.path.join(local_path, os.path.relpath(blob.name, gcs_folder))
        local_file_dir = os.path.dirname(local_file_path)
        os.makedirs(local_file_dir, exist_ok=True)
        blob.download_to_filename(local_file_path)
    logging.info(f"Downloaded GCS folder '{gcs_folder}' to '{local_path}'")

def upload_directory_to_gcs(local_path, bucket_name, gcs_folder):
    """Uploads a local directory to a GCS folder."""
    bucket = storage_client.bucket(bucket_name)
    for local_file in os.listdir(local_path):
        local_file_path = os.path.join(local_path, local_file)
        if os.path.isfile(local_file_path):
            blob = bucket.blob(os.path.join(gcs_folder, local_file))
            blob.upload_from_filename(local_file_path)
    logging.info(f"Uploaded '{local_path}' to GCS folder '{gcs_folder}'")

# --- Main Logic ---

def perform_vectorstore_update():
    """
    Encapsulates the logic to create or update the Chroma vector store from GCS.
    """
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

    # 1. Download existing vector store from GCS
    try:
        download_directory_from_gcs(CHROMA_BUCKET_NAME, 'db', LOCAL_DB_PATH)
    except Exception as e:
        logging.warning(f"Could not download existing DB, will create a new one. Error: {e}")

    # 2. Load the vector store if it exists
    vectorstore = None
    processed_files = set()
    if os.path.exists(LOCAL_DB_PATH) and os.listdir(LOCAL_DB_PATH):
        logging.info("Loading existing vector store from local temp directory.")
        vectorstore = Chroma(persist_directory=LOCAL_DB_PATH, embedding_function=embeddings)
        # Get list of already processed files from metadata
        existing_docs = vectorstore.get(include=["metadatas"])
        processed_files = {metadata['filename'] for metadata in existing_docs['metadatas']}
        logging.info(f"Found {len(processed_files)} already processed files.")

    # 3. Check for new files in the source GCS bucket
    pdf_bucket = storage_client.bucket(PDF_BUCKET_NAME)
    all_source_files = {blob.name for blob in pdf_bucket.list_blobs() if blob.name.endswith(".pdf")}
    new_files_to_process = list(all_source_files - processed_files)

    if not new_files_to_process:
        logging.info("No new PDF files to process. Exiting.")
        return # Nothing to do

    logging.info(f"Found {len(new_files_to_process)} new files to process: {new_files_to_process}")

    # 4. Process only the new files
    os.makedirs(LOCAL_PDF_PATH, exist_ok=True)
    new_documents = []
    for filename in new_files_to_process:
        try:
            local_pdf_file_path = os.path.join(LOCAL_PDF_PATH, os.path.basename(filename))
            blob = pdf_bucket.blob(filename)
            blob.download_to_filename(local_pdf_file_path)
            logging.info(f"Processing new PDF: {filename}")

            loader = PyPDFLoader(local_pdf_file_path)
            docs = loader.load()
            for doc in docs:
                doc.page_content = ' '.join(doc.page_content.split())
                doc.metadata["filename"] = filename # Use the full GCS path as the unique ID
            new_documents.extend(docs)
            os.remove(local_pdf_file_path) # Clean up downloaded PDF
        except Exception as e:
            logging.error(f"Error processing {filename}: {e}")

    if not new_documents:
        raise ValueError("Failed to load any new documents. Halting.")

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(new_documents)
    logging.info(f"Splitting new documents into {len(chunks)} chunks.")

    # 5. Add new documents to the store or create a new one
    if vectorstore:
        logging.info("Adding new document chunks to existing vector store.")
        vectorstore.add_documents(documents=chunks)
    else:
        logging.info("Creating new vector store from scratch.")
        vectorstore = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=LOCAL_DB_PATH
        )

    # 6. Persist changes locally and upload the updated DB to GCS
    logging.info("Persisting vector store changes locally.")
    vectorstore.persist()
    logging.info("Uploading updated vector store to GCS.")
    upload_directory_to_gcs(LOCAL_DB_PATH, CHROMA_BUCKET_NAME, 'db')

    logging.info("Vector store update complete.")


@https_fn.on_request()
def updateVectorStore(req: https_fn.Request) -> https_fn.Response:
    # ... (This part of the code remains the same) ...