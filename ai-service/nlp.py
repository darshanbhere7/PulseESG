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
# ESG EVENT TAXONOMY
# ===============================

NEGATIVE_EVENTS = {
    "E": {"toxic": 5, "contamination": 5, "pollution": 4, "emissions": 4, "spill": 4},
    "S": {"injury": 3, "fatality": 4, "harassment": 4, "discrimination": 4, "unsafe": 3, "illness": 3},
    "G": {"fraud": 5, "bribery": 5, "investigation": 4, "audit": 3, "regulatory": 4, "whistleblower": 4}
}

POSITIVE_SIGNALS = [
    "policy approved", "policy introduced", "committee formed", "board-level",
    "compliance settlement", "paid all fines", "third-party verification",
    "publicly disclosed", "bonuses linked", "whistleblower protection",
    "remediation completed", "monitoring installed"
]

RESOLUTION_TERMS = [
    "completed", "resolved", "settled", "approved", "introduced",
    "closed", "launched", "confirmed", "signed", "implemented"
]

ONGOING_RISK_TERMS = [
    "lawsuit", "class action", "alleged", "pending", "claims", "ongoing investigation"
]

BASE_PILLAR_SCORE = 70

# ===============================
# HELPERS
# ===============================

def normalize_text(text: str) -> str:
    return text.lower()[:MAX_TEXT_LENGTH]

def extract_terms(doc) -> List[str]:
    return list(set([t.text.lower() for t in doc if t.is_alpha and not t.is_stop]))

def risk_from_score(score: int) -> str:
    if score < 30:
        return "HIGH"
    elif score < 55:
        return "MEDIUM"
    return "LOW"

# ===============================
# CORE ESG ANALYSIS
# ===============================

def analyze_text(text: str) -> Dict:
    clean_text = normalize_text(text)
    doc = nlp(clean_text)
    terms = extract_terms(doc)

    pillar_penalty = {"E": 0, "S": 0, "G": 0}
    pillar_bonus = {"E": 0, "S": 0, "G": 0}
    pillar_drivers = {"E": set(), "S": set(), "G": set()}
    incidents = []

    has_resolution = any(t in clean_text for t in RESOLUTION_TERMS)
    has_ongoing_risk = any(t in clean_text for t in ONGOING_RISK_TERMS)

    for pillar, keywords in NEGATIVE_EVENTS.items():
        for kw, severity in keywords.items():
            if kw in clean_text:
                penalty = severity * 6

                # Reduce penalty only if there is confirmed remediation AND no ongoing dispute
                if has_resolution and not has_ongoing_risk:
                    penalty = int(penalty * 0.35)

                # Increase penalty if active legal / environmental dispute
                if has_ongoing_risk:
                    if pillar in ["G", "S"]:
                        penalty += 5
                    elif pillar == "E":
                        penalty += 3

                pillar_penalty[pillar] += penalty
                pillar_drivers[pillar].add(kw)

                incidents.append({
                    "pillar": pillar,
                    "incident": f"{kw} related issue",
                    "severity": "HIGH" if severity >= 4 else "MEDIUM",
                    "evidence": [kw]
                })

    # Apply positive bonuses for verified ESG actions
    for signal in POSITIVE_SIGNALS:
        if signal in clean_text and not has_ongoing_risk:
            pillar_bonus["G"] += 8
            pillar_bonus["E"] += 3

    pillar_scores = {}
    for pillar in ["E", "S", "G"]:
        score = BASE_PILLAR_SCORE - pillar_penalty[pillar] + pillar_bonus[pillar]
        score = max(0, min(100, score))
        pillar_scores[pillar] = {
            "score": score,
            "risk": risk_from_score(score),
            "drivers": list(pillar_drivers[pillar])
        }

    overall_score = int(sum(p["score"] for p in pillar_scores.values()) / 3)

    return {
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
            "The entity exhibits ESG exposure driven by a mix of historical incidents, "
            "ongoing disputes, and subsequent remediation actions, with governance reforms "
            "moderating risk when verified."
        )
    }
