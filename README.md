🌱 PulseESG

AI-Powered ESG Risk Intelligence Platform

PulseESG is an AI-driven ESG (Environmental, Social, Governance) risk intelligence platform designed to analyze unstructured information and generate explainable, event-based ESG risk signals for companies.
The system is inspired by institutional ESG frameworks focusing on transparency, auditability, and real-time risk insights.

🔍 What Problem Does PulseESG Solve?

Traditional ESG assessments suffer from:

Heavy dependence on manual analysis

Delayed risk detection

Limited explainability behind ESG scores

Difficulty handling unstructured data (news, reports, disclosures)

🎯 PulseESG bridges this gap by converting unstructured ESG-related content into:

Structured ESG events

Risk-weighted ESG scores

Clear risk classifications (Low / Medium / High)

Full audit trails and historical comparisons

🚀 Core Features
📊 ESG Intelligence

Event-based ESG risk detection

Rule-driven ESG scoring engine

Explainable risk factors per company

Governance maturity recognition (policies, remediation, oversight)

🧠 AI-Driven Analysis

NLP-based entity and event extraction

ESG keyword taxonomy mapping

Severity-weighted impact scoring

Confidence-aware scoring logic

🏢 Platform Capabilities

Company master data management

Portfolio-level ESG overview

ESG audit & analysis history

Role-based access control (Admin / Analyst)

Secure REST APIs

🏗 System Architecture
┌───────────────────────────┐
│        Frontend (React)   │
│  • Dashboards             │
│  • ESG Reports            │
│  • Risk Visualizations    │
└─────────────┬─────────────┘
              │ JWT
┌─────────────▼─────────────┐
│     Backend (Spring Boot) │
│  • Auth & RBAC            │
│  • Company Management     │
│  • ESG Orchestration      │
│  • Audit History          │
└─────────────┬─────────────┘
              │ REST
┌─────────────▼─────────────┐
│     AI Service (FastAPI)  │
│  • NLP Processing         │
│  • ESG Event Detection    │
│  • Rule-Based Scoring     │
└─────────────┬─────────────┘
              │
┌─────────────▼─────────────┐
│   PostgreSQL (Supabase)   │
│  • Users & Roles          │
│  • Companies              │
│  • ESG Scores             │
│  • Audit Logs             │
└───────────────────────────┘



🧩 Project Specifications
🎨 Frontend

React + Vite

Tailwind CSS

shadcn/ui

Recharts

JWT-based protected routes

Role-aware UI rendering

Dark / Light mode support

⚙️ Backend

Spring Boot (Java 21)

RESTful API architecture

JWT authentication & RBAC

PostgreSQL (Supabase)

JPA / Hibernate ORM

Stateless, scalable service design

🤖 AI Microservice

FastAPI (Python)

spaCy NLP pipeline

Rule-based ESG scoring engine

Explainability-first design

Easily extensible to ML models


🔐 Security & Access Control

JWT-based authentication

Role-based authorization:

Admin → Company & system management

Analyst → ESG analysis & insights

Secure API boundaries between services

🌍 Real-World Alignment

PulseESG is designed with institutional ESG workflows in mind:

Auditability over black-box scoring

Explainable ESG decisions

Clear separation of data, intelligence, and presentation layers

Scalable microservice-friendly architecture

This makes the platform suitable for:

ESG research teams

Risk & compliance units

Fintech & investment analytics use cases


🧑‍💻 Author

Darshan Bhere
MCA @ SPIT Mumbai
Aspiring Software Engineer | Backend & Full-Stack Development
Focused on FinTech, Risk Systems, and Scalable Backend Architecture
