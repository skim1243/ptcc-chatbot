#!/usr/bin/env python3

from flask import Flask, request, jsonify
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import os
import logging
import datetime

log_file_path = os.path.join(os.path.dirname(__file__), 'rag-log.txt')

current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
log_message = f"Log entry at {current_time}: Script ran successfully.\n"

with open(log_file_path, 'a') as f:
    f.write(log_message)

print(f"Successfully wrote to {log_file_path}")

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

DISTANCE_THRESHOLD = 1.28

PDF_DATA_DIR = "src/lib/data"
PERSIST_DIRECTORY = './chroma_db'
EMBEDDING_MODEL = "sentence-transformers/all-mpnet-base-v2"

embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

if os.path.exists(PERSIST_DIRECTORY):
    logging.info("Loading existing vector store from disk...")
    vectorstore = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings)
else:
    logging.info("Creating new vector store...")
    if not os.path.exists(PDF_DATA_DIR):
        raise FileNotFoundError(f"PDF data directory not found at: {PDF_DATA_DIR}")

    all_documents = []
    for filename in os.listdir(PDF_DATA_DIR):
        if filename.endswith(".pdf"):
            try:
                loader = PyPDFLoader(os.path.join(PDF_DATA_DIR, filename))
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
    logging.info("Vector store created and persisted.")


@app.route('/get_context', methods=['POST'])
def get_context():
    try:
        data = request.get_json()
        query = data.get('query')

        if not query:
            return jsonify({"error": "Query parameter is missing"}), 400

        retrieved_docs_with_scores = vectorstore.similarity_search_with_score(query, k=5)

        filtered_docs = []
        for doc, score in retrieved_docs_with_scores:
            if score < DISTANCE_THRESHOLD:
                filtered_docs.append((doc, score))
            else:
                logging.info(f"Document rejected with score {score:.4f}")


        context_parts = []
        if filtered_docs:
            for i, (doc, score) in enumerate(filtered_docs):
                context_parts.append(f"Source (File: {doc.metadata.get('filename', 'N/A')}, Score: {score:.4f}):\n{doc.page_content}")
        else:
            logging.warning("No highly relevant documents found for the query.")


        context = "\n\n---\n\n".join(context_parts) if context_parts else "No specific context found from documents."

        return jsonify({"context": context})

    except Exception as e:
        logging.error(f"An error occurred in get_context: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)