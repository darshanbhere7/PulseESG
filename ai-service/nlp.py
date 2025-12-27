import spacy
from typing import Dict, List
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
# ISS-STYLE ESG EVENT TAXONOMY
# (severity: 1–5)
# ===============================

NEGATIVE_EVENTS = {
    "E": {
        "toxic": 5,
        "contamination": 5,
        "pollution": 4,
        "emissions": 4,
        "spill": 4
    },
    "S": {
        "injury": 3,
        "fatality": 4,
        "harassment": 4,
        "discrimination": 4,
        "unsafe": 3,
        "illness": 3
    },
    "G": {
        "fraud": 5,
        "bribery": 5,
        "investigation": 4,
        "audit": 3,
        "regulatory": 4,
        "whistleblower": 4
    }
}

BASE_PILLAR_SCORE = 70

# ===============================
# HELPERS
# ===============================

def normalize_text(text: str) -> str:
    return text.lower()[:MAX_TEXT_LENGTH]


def extract_terms(doc) -> List[str]:
    terms = set()

    for chunk in doc.noun_chunks:
        terms.add(chunk.text.lower())

    for token in doc:
        if token.is_alpha and not token.is_stop:
            terms.add(token.text.lower())

    return list(terms)


def risk_from_score(score: int) -> str:
    if score < 30:
        return "HIGH"
    elif score < 55:
        return "MEDIUM"
    return "LOW"


# ===============================
# CORE ISS ESG ANALYSIS
# ===============================

def analyze_text(text: str) -> Dict:
    doc = nlp(normalize_text(text))
    terms = extract_terms(doc)

    pillar_penalty = {"E": 0, "S": 0, "G": 0}
    pillar_drivers = {"E": set(), "S": set(), "G": set()}
    incidents = []

    for pillar, keywords in NEGATIVE_EVENTS.items():
        for kw, severity in keywords.items():
            if any(kw in t for t in terms):
                penalty = severity * 6
                pillar_penalty[pillar] += penalty
                pillar_drivers[pillar].add(kw)

                incidents.append({
                    "pillar": pillar,
                    "incident": f"{kw} related issue",
                    "severity": (
                        "CRITICAL" if severity >= 5
                        else "HIGH" if severity >= 4
                        else "MEDIUM"
                    ),
                    "evidence": [kw]
                })

    pillar_scores = {}
    for pillar in ["E", "S", "G"]:
        score = max(0, BASE_PILLAR_SCORE - pillar_penalty[pillar])
        pillar_scores[pillar] = {
            "score": score,
            "risk": risk_from_score(score),
            "drivers": list(pillar_drivers[pillar])
        }

    overall_score = int(
        (pillar_scores["E"]["score"]
         + pillar_scores["S"]["score"]
         + pillar_scores["G"]["score"]) / 3
    )

    result = {
        "overallAssessment": {
            "esgScore": overall_score,
            "riskLevel": risk_from_score(overall_score)
        },
        "pillarAssessment": pillar_scores,
        "keyIncidents": incidents,
        "governanceAssessment": {
            "overallRisk": pillar_scores["G"]["risk"],
            "concerns": pillar_scores["G"]["drivers"]
        },
        "analystSummary": (
            "The entity exhibits elevated ESG risk primarily driven by "
            "environmental and governance-related incidents. "
            "These risks may have material regulatory and reputational implications."
        )
    }

    return result
