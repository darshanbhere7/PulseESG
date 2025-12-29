🌱 PulseESG

AI-Powered ESG Risk Intelligence Platform

PulseESG is an AI-driven ESG (Environmental, Social, Governance) risk intelligence platform designed to deliver explainable ESG risk insights from unstructured information. The system is conceptually aligned with institutional ESG approaches with a strong emphasis on auditability, transparency, and scalable backend architecture.

✨ Key Features

ESG analysis history and audit trail

Independent AI microservice for ESG intelligence

Explainable ESG risk signals

Role-based access control (Admin / Analyst)

Company master data management

🏗 System Architecture
+-----------------------------+
|       Frontend (React)      |
|  - Dashboards & Analytics   |
|  - ESG Reports              |
|  - Secure UI Access         |
+-------------+---------------+
              |
              | JWT-secured REST APIs
              v
+-----------------------------+
|   Backend (Spring Boot)     |
|  - Authentication & RBAC    |
|  - ESG Orchestration        |
|  - Company Management       |
|  - Audit & History          |
+-------------+---------------+
              |
              | Service Integration
              v
+-----------------------------+
|     AI Service (FastAPI)    |
|  - NLP Processing           |
|  - ESG Signal Detection     |
|  - Explainable Scoring      |
+-------------+---------------+
              |
              v
+-----------------------------+
|  PostgreSQL (Supabase)      |
|  - Users & Roles            |
|  - Companies                |
|  - ESG Analyses             |
|  - Audit Logs               |
+-----------------------------+


✅ This will render perfectly on GitHub
✅ Looks clean in dark & light mode
✅ Reads like an enterprise architecture diagram

🧰 Tech Stack
Frontend
React + Vite, Tailwind CSS, shadcn/ui, Recharts

Backend
Spring Boot, JWT Authentication & RBAC, PostgreSQL (Supabase), JPA / Hibernate

AI Service
FastAPI (Python), spaCy NLP pipeline, Rule-based ESG intelligence

📂 Project Structure
pulse-esg/
├── frontend/        # React UI
├── backend/         # Spring Boot REST APIs
├── ai-service/      # FastAPI ESG intelligence
├── docs/            # Architecture & references
└── README.md

🔐 Security

JWT-based authentication

Role-based authorization

Stateless backend services

Clear separation of concerns

🎯 Objective

PulseESG is built as a production-oriented ESG risk intelligence system suitable for fintech, compliance, and investment analytics use cases, prioritizing explainability and auditability over black-box scoring.

👤 Author

Darshan Bhere
SPIT ’26 | Software Engineer | REST API Developer | Java • Spring Boot • Microservices | Full-Stack MERN
