# functions/update_vectorstore.py

import os
import logging
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from firebase_functions import https_fn
from firebase_admin import initialize_app

logging.basicConfig(level=logging.INFO)

PDF_DATA_DIR = "data"
PERSIST_DIRECTORY = './chroma_db'
EMBEDDING_MODEL = "sentence-transformers/all-mpnet-base-v2"

initialize_app()

def perform_vectorstore_update():
    """
    Encapsulates the logic to create or update the Chroma vector store.
    This is the core "cron job" task.
    """
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

    # Check if the persist directory exists relative to the function's root
    # Cloud Functions file system is ephemeral, so persistence means writing
    # to Cloud Storage or re-creating on each run if data source is small.
    # For larger DBs, you'd load from GCS and save back.
    # For this example, we'll assume it's created or re-created on each run if needed.

    if os.path.exists(PERSIST_DIRECTORY):
        logging.info("Attempting to load existing vector store (Note: ephemeral FS in CF)...")
        # For actual persistence across Cloud Function invocations,
        # you'd likely download from Google Cloud Storage here.
        # Example: vectorstore = load_from_gcs_or_similar()
        try:
            vectorstore = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings)
            logging.info("Loaded existing vector store.")
        except Exception as e:
            logging.warning(f"Failed to load existing vector store, re-creating: {e}")
            vectorstore = None
    else:
        vectorstore = None

    if vectorstore is None: # If not loaded or creation is forced
        logging.info("Creating or re-creating new vector store...")

        if not os.path.exists(PDF_DATA_DIR):
            logging.error(f"PDF data directory not found in function deployment: {PDF_DATA_DIR}")
            raise FileNotFoundError(f"PDF data directory not found at: {PDF_DATA_DIR}")

        all_documents = []
        for filename in os.listdir(PDF_DATA_DIR):
            if filename.endswith(".pdf"):
                file_path = os.path.join(PDF_DATA_DIR, filename)
                logging.info(f"Loading PDF: {file_path}")
                try:
                    loader = PyPDFLoader(file_path)
                    docs = loader.load()
                    for doc in docs:
                        cleaned_text = ' '.join(doc.page_content.split())
                        doc.page_content = cleaned_text
                        doc.metadata["filename"] = filename
                    all_documents.extend(docs)
                except Exception as e:
                    logging.error(f"Error loading {filename}: {e}")

        if not all_documents:
            raise ValueError("No documents were loaded. Halting execution.")

        logging.info(f"Loaded {len(all_documents)} pages from PDF files.")

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(all_documents)

        logging.info(f"Splitting into {len(chunks)} chunks.")
        logging.info("Computing embeddings and creating vector store. This may take a while...")

        vectorstore = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=PERSIST_DIRECTORY
        )
        logging.info("Vector store created and persisted locally in CF runtime.")

        # For actual persistence, you would then upload PERSIST_DIRECTORY contents to GCS
        # Example: upload_directory_to_gcs(PERSIST_DIRECTORY, 'your-chroma-bucket')

@https_fn.on_request()
def updateVectorStore(req: https_fn.Request) -> https_fn.Response:
    """
    HTTP Cloud Function to be triggered by Cloud Scheduler.
    It calls the vector store update logic.
    """
    print("--- updateVectorStore Cloud Function triggered ---")

    try:
        perform_vectorstore_update()
        print("--- Vector store update process completed successfully ---")
        return https_fn.Response("Vector store updated successfully!", status=200)

    except Exception as e:
        print(f"--- Vector store update process FAILED: {e} ---")
        import traceback
        traceback.print_exc()
        return https_fn.Response(f"Vector store update failed: {e}", status=500)