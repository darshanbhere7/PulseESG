import spacy
from typing import List, Dict
from dotenv import load_dotenv
import os

# ===============================
# ENV SETUP
# ===============================
load_dotenv()

SPACY_MODEL = os.getenv("SPACY_MODEL", "en_core_web_sm")
MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", 4000))

nlp = spacy.load(SPACY_MODEL)

# ===============================
# ESG EVENT TAXONOMY (CORE FIX)
# ===============================

NEGATIVE_EVENTS = {
    "G": [
        "fraud", "investigation", "violation", "penalty", "bribery",
        "lawsuit", "non-compliance", "regulatory breach", "audit failure"
    ],
    "E": [
        "pollution", "spill", "emissions breach", "environmental damage",
        "toxic", "contamination"
    ],
    "S": [
        "labor violation", "unsafe working", "harassment",
        "discrimination", "injury", "fatality"
    ]
}

POSITIVE_SIGNALS = {
    "G": [
        "open source", "audit readiness", "governance framework",
        "compliance system", "traceability", "validation",
        "regulatory alignment", "issb", "csrd", "disclosure",
        "internal controls", "risk management"
    ],
    "E": [
        "sustainability reporting", "emissions tracking",
        "climate disclosure", "carbon accounting"
    ],
    "S": [
        "workforce transparency", "employee safety system",
        "diversity reporting", "community engagement"
    ]
}

# ===============================
# HELPERS
# ===============================

def normalize_text(text: str) -> str:
    text = text.lower()
    return text[:MAX_TEXT_LENGTH]


def extract_phrases(doc) -> List[str]:
    phrases = set()

    for chunk in doc.noun_chunks:
        phrases.add(chunk.text.lower())

    for token in doc:
        if token.is_alpha and not token.is_stop:
            phrases.add(token.text.lower())

    return list(phrases)


# ===============================
# EVENT CLASSIFICATION
# ===============================

def detect_signals(phrases: List[str]) -> Dict:
    detected = {
        "negative": {"E": [], "S": [], "G": []},
        "positive": {"E": [], "S": [], "G": []}
    }

    for pillar, keywords in NEGATIVE_EVENTS.items():
        for kw in keywords:
            if any(kw in p for p in phrases):
                detected["negative"][pillar].append(kw)

    for pillar, keywords in POSITIVE_SIGNALS.items():
        for kw in keywords:
            if any(kw in p for p in phrases):
                detected["positive"][pillar].append(kw)

    return detected


# ===============================
# SCORING ENGINE (ISS / MSCI STYLE)
# ===============================

def calculate_esg_score(signals: Dict) -> Dict:
    base_score = 70  # neutral baseline

    negative_hits = sum(len(v) for v in signals["negative"].values())
    positive_hits = sum(len(v) for v in signals["positive"].values())

    # Penalties (risk matters more)
    base_score -= negative_hits * 12

    # Rewards (governance maturity)
    base_score += positive_hits * 6

    score = max(0, min(100, base_score))

    if negative_hits >= 3:
        risk = "HIGH"
    elif negative_hits >= 1:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return {
        "score": score,
        "riskLevel": risk
    }


# ===============================
# MAIN ANALYSIS FUNCTION
# ===============================

def analyze_text(text: str) -> Dict:
    clean_text = normalize_text(text)
    doc = nlp(clean_text)

    phrases = extract_phrases(doc)
    signals = detect_signals(phrases)
    scoring = calculate_esg_score(signals)

    explanation_parts = []

    if sum(len(v) for v in signals["positive"].values()) > 0:
        explanation_parts.append(
            "Positive ESG governance and reporting infrastructure signals detected."
        )

    if sum(len(v) for v in signals["negative"].values()) > 0:
        explanation_parts.append(
            "Potential ESG risk events detected requiring analyst review."
        )

    if not explanation_parts:
        explanation_parts.append(
            "No material ESG risk or improvement signals detected."
        )

    return {
        "esgScore": scoring["score"],
        "riskLevel": scoring["riskLevel"],
        "signals": signals,
        "explanation": " ".join(explanation_parts)
    }
