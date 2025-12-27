from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import ESGRequest
from nlp import analyze_text
from dotenv import load_dotenv
import os

# ===============================
# LOAD ENVIRONMENT VARIABLES
# ===============================
load_dotenv()

SPACY_MODEL = os.getenv("SPACY_MODEL", "en_core_web_sm")

# ===============================
# FASTAPI APP
# ===============================
app = FastAPI(
    title="PulseESG AI Service",
    description="ISS-style ESG risk intelligence microservice",
    version="2.0.0"
)

# ===============================
# CORS
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# HEALTH CHECK
# ===============================
@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "PulseESG AI Service",
        "model": SPACY_MODEL
    }

# ===============================
# ESG ANALYSIS ENDPOINT
# ===============================
@app.post("/analyze")
def analyze_esg(request: ESGRequest):
    """
    ISS-style ESG analysis endpoint
    """

    return analyze_text(request.text)
