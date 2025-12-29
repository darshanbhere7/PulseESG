# 🌱 PulseESG
**AI-Powered ESG Risk Intelligence Platform**

PulseESG is an AI-driven ESG (Environmental, Social, Governance) risk intelligence platform designed to analyze unstructured information and generate explainable, event-based ESG risk signals for companies. 

The system is inspired by institutional ESG frameworks focusing on **transparency**, **auditability**, and **real-time risk insights**.

---

## 🔍 What Problem Does PulseESG Solve?

Traditional ESG assessments suffer from:
* ❌ Heavy dependence on manual analysis
* ❌ Delayed risk detection
* ❌ Limited explainability behind ESG scores
* ❌ Difficulty handling unstructured data (news, reports, disclosures)

**🎯 PulseESG bridges this gap by converting unstructured ESG-related content into:**
* ✅ Structured ESG events
* ✅ Risk-weighted ESG scores
* ✅ Clear risk classifications (Low / Medium / High)
* ✅ Full audit trails and historical comparisons

---

## 🚀 Core Features

### 📊 ESG Intelligence
* **Event-based ESG risk detection**
* **Rule-driven ESG scoring engine**
* **Explainable risk factors** per company
* **Governance maturity recognition** (policies, remediation, oversight)

### 🧠 AI-Driven Analysis
* **NLP-based entity and event extraction**
* **ESG keyword taxonomy mapping**
* **Severity-weighted impact scoring**
* **Confidence-aware scoring logic**

### 🏢 Platform Capabilities
* **Company master data management**
* **Portfolio-level ESG overview**
* **ESG audit & analysis history**
* **Role-based access control** (Admin / Analyst)
* **Secure REST APIs**

---

## 🏗 System Architecture

The alignment issue usually occurs because standard text fonts vary in width. Below is the fixed diagram using a code block:

```text
┌───────────────────────────────────────┐
│           Frontend (React)            │
│  • Dashboards                         │
│  • ESG Reports                        │
│  • Risk Visualizations                │
└───────────────────┬───────────────────┘
                    │ Secure REST APIs (JWT)
                    ▼
┌───────────────────────────────────────┐
│         Backend (Spring Boot)         │
│  • Auth & RBAC                        │
│  • Company Management                 │
│  • ESG Orchestration                  │
│  • Audit History                      │
└───────────────────┬───────────────────┘
                    │ Service Integration
                    ▼
┌───────────────────────────────────────┐
│         AI Service (FastAPI)          │
│  • NLP Processing                     │
│  • ESG Event Detection                │
│  • Rule-Based Scoring                 │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│         PostgreSQL (Supabase)         │
│  • Users & Roles                      │
│  • Companies                          │
│  • ESG Scores                         │
│  • Audit Logs                         │
└───────────────────────────────────────┘
