from pydantic import BaseModel
from typing import Dict, List


# ===============================
# REQUEST SCHEMA
# ===============================
class ESGRequest(BaseModel):
    text: str


# ===============================
# SIGNAL STRUCTURE
# ===============================
class ESGSignals(BaseModel):
    E: List[str]
    S: List[str]
    G: List[str]


class ESGSignalContainer(BaseModel):
    positive: ESGSignals
    negative: ESGSignals


# ===============================
# RESPONSE SCHEMA (ISS / MSCI STYLE)
# ===============================
class ESGResponse(BaseModel):
    esgScore: int
    riskLevel: str  # LOW | MEDIUM | HIGH
    signals: ESGSignalContainer
    explanation: str
