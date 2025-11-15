import os
import threading
import time
from typing import Dict

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_community.document_loaders import PyPDFLoader
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter

# -------------------------
# PATHS
# -------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_PATH = os.path.join(BASE_DIR, "static", "docs", "Medical_book.pdf")
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_db")

EMBEDDING_MODEL = "nomic-embed-text"
LLM_MODEL = "llama3"

# -------------------------
# GLOBAL VECTORSTORE
# -------------------------
_VECTORSTORE = None
_VECTORSTORE_LOCK = threading.Lock()

# -------------------------
# SIMPLE CACHE
# -------------------------
_QUERY_CACHE: Dict[str, Dict] = {}
_CACHE_TTL = 3600
_CACHE_MAX = 200


def cache_get(key: str):
    data = _QUERY_CACHE.get(key)
    if not data:
        return None
    if time.time() - data["time"] > _CACHE_TTL:
        del _QUERY_CACHE[key]
        return None
    return data["value"]


def cache_set(key: str, value: str):
    if len(_QUERY_CACHE) >= _CACHE_MAX:
        oldest = sorted(_QUERY_CACHE.items(), key=lambda x: x[1]["time"])[0][0]
        del _QUERY_CACHE[oldest]

    _QUERY_CACHE[key] = {"value": value, "time": time.time()}


# -------------------------
# LOAD OR BUILD VECTORSTORE
# -------------------------
def load_vectorstore():
    global _VECTORSTORE

    # Already loaded
    if _VECTORSTORE is not None:
        return _VECTORSTORE

    with _VECTORSTORE_LOCK:
        # Double check inside lock
        if _VECTORSTORE is not None:
            return _VECTORSTORE

        embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)

        # ---- CASE 1: LOAD EXISTING ----
        if os.path.exists(CHROMA_DIR) and os.listdir(CHROMA_DIR):
            print("Loading existing Chroma DB...")
            _VECTORSTORE = Chroma(
                embedding_function=embeddings,
                persist_directory=CHROMA_DIR
            )
            return _VECTORSTORE

        # ---- CASE 2: BUILD FROM PDF ----
        print("Building Chroma DB for the first time...")

        if not os.path.exists(PDF_PATH):
            raise FileNotFoundError("PDF file missing: " + PDF_PATH)

        loader = PyPDFLoader(PDF_PATH)
        docs = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=200
        )
        docs = splitter.split_documents(docs)

        _VECTORSTORE = Chroma.from_documents(
            documents=docs,
            embedding=embeddings,
            persist_directory=CHROMA_DIR
        )

        _VECTORSTORE.persist()
        print("Chroma DB built and saved.")

        return _VECTORSTORE


# -------------------------
# CHAT API
# -------------------------
class ChatView(APIView):
    permission_classes = [AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # Load vectorstore one time
        try:
            self.vectorstore = load_vectorstore()
        except Exception as e:
            print("Vectorstore load error:", e)
            self.vectorstore = None

        self.llm = ChatOllama(model=LLM_MODEL, temperature=0.7)  # Higher temp for general answers

    def post(self, request):
        query = request.data.get("message", "").strip()

        if not query:
            return Response({"error": "Message cannot be empty"}, status=400)

        # ---- CACHE ----
        cached = cache_get(query)
        if cached:
            return Response({"response": cached})

        if self.vectorstore is None:
            # if vectorstore unavailable -> directly LLM fallback
            try:
                llm_answer = self.llm.invoke(query).content.strip()
            except Exception as e:
                print(f"LLM error: {e}")
                llm_answer = "I'm having trouble processing your request right now."
            cache_set(query, llm_answer)
            return Response({"response": llm_answer})

        # ---- RAG RETRIEVAL ----
        try:
            retriever = self.vectorstore.as_retriever(search_kwargs={"k": 3})
            docs = retriever.invoke(query)
        except Exception as e:
            print(f"Retrieval error: {e}")
            docs = []

        # -------------------------------
        # 1️⃣ If NO docs → fallback to LLM
        # -------------------------------
        if not docs:
            print("No documents found, falling back to LLM")
            try:
                llm_answer = self.llm.invoke(query).content.strip()
            except Exception as e:
                print(f"LLM error: {e}")
                llm_answer = "I'm having trouble processing your request right now."
            cache_set(query, llm_answer)
            return Response({"response": llm_answer})

        # ---- BUILD CONTEXT ----
        context = "\n\n".join(doc.page_content for doc in docs)

        prompt = f"""You are a helpful medical assistant.

First, check if the following context contains information relevant to the question.

Context:
{context}

Question: {query}

If the context contains relevant information, answer based on it.
If the context does NOT contain relevant information, respond with exactly: "NOT_IN_DOCUMENT"

Answer:"""

        # ---- RAG LLM CALL ----
        try:
            result = self.llm.invoke(prompt)
            answer = result.content.strip()
        except Exception as e:
            print(f"LLM error during RAG: {e}")
            answer = "NOT_IN_DOCUMENT"

        # -----------------------------------------
        # 2️⃣ If PDF doesn't contain answer → fallback LLM
        # -----------------------------------------
        if "NOT_IN_DOCUMENT" in answer.upper() or "I DON'T KNOW" in answer.upper():
            print("Answer not in document, falling back to general LLM")
            
            general_prompt = f"""You are a helpful medical assistant. Answer the following question to the best of your knowledge.
Provide a clear, accurate, and helpful general answer.

Question: {query}

Answer:"""
            
            try:
                general_result = self.llm.invoke(general_prompt)
                answer = general_result.content.strip()
            except Exception as e:
                print(f"LLM error during fallback: {e}")
                answer = "I'm having trouble processing your request right now."

        cache_set(query, answer)
        return Response({"response": answer})