🌱 PulseESG

AI-Powered ESG Risk Intelligence Platform

PulseESG is an AI-driven ESG (Environmental, Social, Governance) risk intelligence platform that converts unstructured information into explainable ESG risk insights.
The platform is conceptually aligned with institutional ESG frameworks used by MSCI and ISS, with emphasis on transparency, auditability, and scalable system design.

✨ Key Capabilities

Explainable ESG risk signal generation

Governance and remediation signal recognition

Role-based access control (Admin / Analyst)

Company master data management

ESG analysis history and audit trail

Independent AI microservice for ESG intelligence

🏗 System Architecture
┌──────────────────────────────┐
│        Frontend (React)      │
│  • Dashboards & Analytics   │
│  • ESG Reports              │
│  • Secure UI Access         │
└───────────────┬─────────────┘
                │ JWT-secured REST APIs
┌───────────────▼─────────────┐
│     Backend (Spring Boot)   │
│  • Authentication & RBAC    │
│  • ESG Orchestration        │
│  • Company Management       │
│  • Audit & History          │
└───────────────┬─────────────┘
                │ Service Integration
┌───────────────▼─────────────┐
│   AI Service (FastAPI)      │
│  • NLP Processing           │
│  • ESG Signal Detection     │
│  • Explainable Scoring      │
└───────────────┬─────────────┘
                │
┌───────────────▼─────────────┐
│ PostgreSQL (Supabase)       │
│  • Users & Roles            │
│  • Companies                │
│  • ESG Analyses             │
│  • Audit Logs               │
└─────────────────────────────┘

🧰 Tech Stack
Frontend

React + Vite

Tailwind CSS

shadcn/ui

Recharts

Backend

Spring Boot (Java 21)

JWT Authentication

Role-Based Access Control

PostgreSQL (Supabase)

JPA / Hibernate

AI Service

FastAPI (Python)

spaCy NLP pipeline

Rule-driven ESG intelligence engine

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

🎯 Platform Objective

PulseESG is designed as a production-oriented ESG risk intelligence system suitable for fintech, compliance, and investment analytics workflows, prioritizing explainability and auditability over black-box scoring.

👤 Author

Darshan Bhere
SPIT ’26 | Software Engineer | REST API Developer | Java • Spring Boot • Microservices | Full-Stack MERN
