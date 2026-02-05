import os
from dotenv import load_dotenv
from src.helper import (
    load_pdf_file,
    filter_to_minimal_docs,
    text_split,
    download_hugging_face_embeddings
)
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore

load_dotenv()
21
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

if not PINECONE_API_KEY:
    raise ValueError("❌ PINECONE_API_KEY not found in .env")

os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY


# STEP 1 — LOAD & PROCESS PDF
print("📄 Loading PDF...")
docs = load_pdf_file("static/docs")
clean_docs = filter_to_minimal_docs(docs)
chunks = text_split(clean_docs)

print(f"📦 Total chunks created: {len(chunks)}")


# STEP 2 — LOAD EMBEDDINGS
print("🔢 Loading Embeddings...")
embeddings = download_hugging_face_embeddings()


# STEP 3 — INIT PINECONE
index_name = "medical-chatbot"
pc = Pinecone(api_key=PINECONE_API_KEY)

if not pc.has_index(index_name):
    print("⚙ Creating Pinecone Index...")
    pc.create_index(
        name=index_name,
        dimension=384,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )
else:
    print("✔ Index already exists.")

print("⬆ Uploading vectors...")

PineconeVectorStore.from_documents(
    documents=chunks,
    embedding=embeddings,
    index_name=index_name
)

print("🎉 Indexing Completed Successfully!")