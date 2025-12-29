🌱 PulseESG

AI-Powered ESG Risk Intelligence Platform

PulseESG is an AI-driven ESG (Environmental, Social, Governance) risk intelligence platform that transforms unstructured information into explainable ESG risk insights. The system is conceptually aligned with institutional ESG methodologies used by MSCI and ISS, with a focus on transparency, auditability, and scalable system design.

✨ Key Capabilities

ESG analysis history and audit trail

Independent AI microservice for ESG intelligence

Explainable ESG risk signals

Role-based access control (Admin / Analyst)

Company master data management

🏗 System Architecture
flowchart TB
    UI[Frontend\n(React)]
    API[Backend\n(Spring Boot)]
    AI[AI Service\n(FastAPI)]
    DB[(PostgreSQL\nSupabase)]

    UI -->|JWT-secured REST APIs| API
    API -->|Service Integration| AI
    AI -->|ESG Insights| API
    API --> DB

    UI:::layer
    API:::layer
    AI:::layer
    DB:::layer

    classDef layer fill:#0f172a,stroke:#38bdf8,stroke-width:1px,color:#e5e7eb

🧩 Architecture Layers

Frontend (React)

Dashboards & analytics

ESG reports

Secure UI access

Backend (Spring Boot)

Authentication & RBAC

ESG orchestration

Company management

Audit & history

AI Service (FastAPI)

NLP processing

ESG signal detection

Explainable scoring

Database (PostgreSQL – Supabase)

Users & roles

Companies

ESG analyses

Audit logs

🧰 Tech Stack
Frontend

React + Vite

Tailwind CSS

shadcn/ui

Recharts

Backend

Spring Boot (Java 21)

JWT Authentication & RBAC

PostgreSQL (Supabase)

JPA / Hibernate

AI Service

FastAPI (Python)

spaCy NLP pipeline

Rule-based ESG intelligence

📂 Project Structure
pulse-esg/
├── frontend/        # React UI
├── backend/         # Spring Boot APIs
├── ai-service/      # FastAPI ESG intelligence
├── docs/            # Architecture & references
└── README.md

🔐 Security

JWT-based authentication

Role-based authorization

Stateless backend services

Clear service boundaries

🎯 Objective

PulseESG is designed as a production-oriented ESG risk intelligence system for fintech, compliance, and investment analytics use cases, prioritizing explainability and auditability over black-box scoring.

👤 Author

Darshan Bhere
SPIT ’26 | Software Engineer | REST API Developer | Java • Spring Boot • Microservices | Full-Stack MERN
