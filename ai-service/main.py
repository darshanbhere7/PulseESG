from fastapi import FastAPI
from schemas import ESGRequest, ESGResponse
from nlp import analyze_text
from dotenv import load_dotenv
import os

# ===============================
# LOAD ENV
# ===============================
load_dotenv()

APP_PORT = int(os.getenv("AI_SERVICE_PORT", 8001))

# ===============================
# FASTAPI APP
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
    return {"status": "UP"}


# ===============================
# ESG ANALYSIS ENDPOINT
# ===============================
@app.post("/analyze", response_model=ESGResponse)
def analyze_esg(request: ESGRequest):

    """
    Core ESG intelligence endpoint.
    Accepts unstructured ESG-related text and returns
    risk-oriented ESG signals (not sentiment).
    """

    result = analyze_text(request.text)

    return ESGResponse(
        esgScore=result["esgScore"],
        riskLevel=result["riskLevel"],
        signals=result["signals"],
        explanation=result["explanation"]
    )
