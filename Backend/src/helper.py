import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings


def load_pdf_file(data: str):
    """
    Loads all PDF files from the /data folder.
    """
    docs = []
    for file in os.listdir(data):
        if file.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(data, file))
            docs.extend(loader.load())
    return docs


def filter_to_minimal_docs(docs):
    """
    Clean empty pages and remove useless whitespace.
    """
    clean_docs = []
    for doc in docs:
        text = doc.page_content.strip()
        if len(text) > 10:
            doc.page_content = text
            clean_docs.append(doc)
    return clean_docs


def text_split(docs):
    """
    Split documents into small overlapping chunks.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=200
    )
    return splitter.split_documents(docs)


def download_hugging_face_embeddings():
    """
    Loads a light, fast, accurate embedding model (384-dim).
    """
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")