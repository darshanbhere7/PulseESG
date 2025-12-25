from fastapi import FastAPI
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

    Accepts unstructured ESG-related text and returns:
    - ESG Score
    - Risk Level
    - ESG Signals
    - Explanation
    """

    result = analyze_text(request.text)

    return ESGResponse(
        esgScore=result["esgScore"],
        riskLevel=result["riskLevel"],
        signals=result["signals"],
        explanation=result["explanation"]
    )
