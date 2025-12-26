from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import ESGRequest, ESGResponse
from nlp import analyze_text
from dotenv import load_dotenv
import os

# ===============================
# LOAD ENVIRONMENT VARIABLES
# ===============================
load_dotenv()

SPACY_MODEL = os.getenv("SPACY_MODEL", "en_core_web_sm")
SENTIMENT_MODEL = os.getenv(
    "SENTIMENT_MODEL",
    "distilbert-base-uncased-finetuned-sst-2-english"
)

# ===============================
# FASTAPI APP INITIALIZATION
# ===============================
app = FastAPI(
    title="ESG AI Service",
    description="AI-driven ESG risk intelligence microservice (ISS / MSCI style)",
    version="1.0.0"
)

# ===============================
# CORS MIDDLEWARE (REQUIRED FOR RENDER SERVICE-TO-SERVICE)
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for service-to-service communication
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
        "models": {
            "spacy": SPACY_MODEL,
            "sentiment": SENTIMENT_MODEL
        }
    }

# ===============================
# ESG ANALYSIS ENDPOINT
# ===============================
@app.post("/analyze", response_model=ESGResponse)
def analyze_esg(request: ESGRequest):
    """
    Core ESG intelligence endpoint.
    """

    result = analyze_text(request.text)

    return ESGResponse(
        esgScore=result["esgScore"],
        riskLevel=result["riskLevel"],
        signals=result["signals"],
        explanation=result["explanation"]
    )
