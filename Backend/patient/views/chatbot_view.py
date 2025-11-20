import os
from dotenv import load_dotenv
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from src.helper import download_hugging_face_embeddings
from src.prompt import system_prompt


# Load environment
load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY
os.environ["GROQ_API_KEY"] = GROQ_API_KEY



# -----------------------------------------------------
# Load Embeddings + VectorStore (Pinecone)
# -----------------------------------------------------
embeddings = download_hugging_face_embeddings()

vectorstore = PineconeVectorStore.from_existing_index(
    index_name="medical-chatbot",
    embedding=embeddings
)

retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}
)


# -----------------------------------------------------
# Load Groq LLM
# -----------------------------------------------------
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.6,
    max_tokens=512
)


# -----------------------------------------------------
# RAG Prompt Template
# -----------------------------------------------------
prompt = ChatPromptTemplate.from_template("""
You are a knowledgeable medical assistant.

Use the context below to answer the question.
If the answer is NOT found in the context, reply only with: "NOT_IN_DOCUMENT".

Context:
{context}

Question:
{user_question}

Answer:
""")


# -----------------------------------------------------
# Django API View
# -----------------------------------------------------
class MedicalChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_message = request.data.get("message", "").strip()

        if not user_message:
            return Response({"error": "Message field is required"}, status=400)

        # Step 1: Retrieve relevant documents
        docs = retriever.invoke(user_message)

        context = "\n\n".join(doc.page_content for doc in docs)

        # Step 2: Build Prompt
        final_prompt = prompt.format(
            context=context,
            user_question=user_message
        )

        # Step 3: Call LLM
        llm_response = llm.invoke(final_prompt)

        answer = llm_response.content.strip()

        # Step 4: Fallback if answer missing
        if answer == "NOT_IN_DOCUMENT":
            answer = "Sorry, I could not find this information in the medical documents."

        return Response({"response": answer})