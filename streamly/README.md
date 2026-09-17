# STREAMLY — AI-Powered OTT Audience Personalization Platform

> *"Understand Your Watch. Discover Your Next."*

[![Docker Compose](https://img.shields.io/badge/Docker--Compose-Ready-blue?logo=docker)](file:///Users/srisharadhakrishnan/streamly/docker-compose.yml)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-emerald?logo=fastapi)](file:///Users/srisharadhakrishnan/streamly/backend/app/main.py)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-crimson?logo=react)](file:///Users/srisharadhakrishnan/streamly/frontend)
[![Evaluator](https://img.shields.io/badge/Evaluator-100%25%20Pass-success)](file:///Users/srisharadhakrishnan/streamly/metrics.json)

---

## 📌 Executive Overview

**STREAMLY** is a hackathon-ready OTT audience segmentation and personalization service. It analyzes raw viewer behavior (watch time, session duration, viewing frequency, genre preferences, completion rates), automatically discovers natural audience clusters using unsupervised machine learning (**StandardScaler + KMeans**), exposes personalized movie recommendations via a containerized REST API, and provides a cinematic dark OTT web interface alongside data-driven Admin and Analyst dashboards.

---

## 🏗️ System Architecture

```
                       +----------------------------------+
                       |  Dataset (data/ott_viewers.csv)   |
                       +----------------+-----------------+
                                        |
                                        v
                       +----------------+-----------------+
                       |         TRAINER SERVICE          |
                       |  - StandardScaler              |
                       |  - Silhouette & Inertia Tuning   |
                       |  - KMeans (K=4) Model Training   |
                       |  - Persists to /models           |
                       +----------------+-----------------+
                                        |
                                        v [Shared /models volume]
                       +----------------+-----------------+
                       |           API SERVICE            |
                       |  - FastAPI (Python 3.11)         |
                       |  - GET /health & POST /recommend |
                       |  - SQLite Database (streamly.db) |
                       |  - Auth (JWT, SHA-256)           |
                       |  - Serves React Frontend         |
                       +--------+----------------+--------+
                                |                ^
                                |                | (HTTP Health/Recommend)
                                v                |
            +-------------------+--+   +---------+-------------------+
            |  REACT FRONTEND      |   |    EVALUATOR SERVICE        |
            |  - Cinematic Dark    |   |  - Waits for API Health     |
            |  - 3D Page-Turn Deck |   |  - 9 Automated Test Cases  |
            |  - Segment DNA       |   |  - Cluster Quality Checks   |
            |  - Familiar-Explore  |   |  - Generates metrics.json   |
            +----------------------+   +-----------------------------+
```

---

## ✨ Signature Features

1. **3D Stacked Card / Book Page-Turn Deck:** Interactive 3D movie cards powered by Framer Motion. Smooth page-turn flip and slide transitions to discover personalized API recommendations.
2. **Segment DNA:** Visual breakdown explaining *why* the ML model placed a viewer into a specific segment using real cluster centroid feature statistics.
3. **Familiar ↔ Explore Control:** Real-time slider enabling viewers to adjust recommendation adventure levels ($0.0 = \text{Familiar}$, $1.0 = \text{Explore}$).
4. **Analyze New Viewer Live Demo:** Judge-friendly interactive modal to input custom viewer metrics and witness real-time ML inference without model retraining.

---

## 🔑 Demo Credentials

The platform automatically seeds SQLite application database credentials upon startup:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@streamly.demo` | `StreamlyAdmin2026!` | User management, SQLite state, system KPIs, model metadata, metrics.json verification |
| **ANALYST** | `analyst@streamly.demo` | `StreamlyAnalyst2026!` | Cluster deep-dives, K evaluation charts, recommendation rules matrix |
| **VIEWER** | `viewer@streamly.demo` | `StreamlyViewer2026!` | Cinematic OTT home page, 3D Page-Turn deck, Segment DNA, Familiar-Explore slider |

---

## 🚀 Quick Start with Docker Compose

Ensure Docker and Docker Compose are installed:

```bash
# 1. Clone the repository
git clone https://github.com/subasri-666/Streamly.git
cd Streamly

# 2. Build and launch all 3 containerized services
docker compose up --build
```

Access the application in your browser at `http://localhost:8000`.

---

## 📡 API Reference

### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "Streamly API",
  "version": "1.0.0",
  "model_loaded": true,
  "database_connected": true,
  "uptime_seconds": 24.5,
  "n_clusters": 4
}
```

### 2. Get Recommendations
```http
POST /recommend
Content-Type: application/json
```
**Sample Request:**
```json
{
  "user_id": "usr-1001",
  "total_watch_time_mins": 3400.0,
  "avg_session_duration_mins": 110.0,
  "number_of_sessions": 30,
  "viewing_frequency_per_week": 9.5,
  "top_genres": ["Action", "Thriller"],
  "exploration_level": 0.5
}
```

---

## 🧪 Evaluator & metrics.json

The independent `evaluator` service runs automatically inside Docker Compose and outputs `metrics.json`:
- **Overall Result:** `PASS`
- **Pass Rate:** `100.0%` (9/9 automated tests)
- **Silhouette Score:** `0.5428`
- **Average Inference Latency:** `17.13 ms`

---

## 📁 Repository Structure

```
Streamly/
├── data/                       # Official ML training dataset
│   └── ott_viewer_activity.csv
├── models/                     # Shared model volume
│   ├── pipeline.joblib
│   ├── segment_metadata.json
│   └── model_metadata.json
├── database/                   # Application database volume
│   └── streamly.db
├── trainer/                    # ML Trainer Service
│   ├── train.py
│   └── Dockerfile
├── backend/                    # REST API & Auth Service
│   ├── app/
│   │   ├── main.py
│   │   ├── ml/
│   │   ├── database/
│   │   └── auth/
│   └── Dockerfile
├── evaluator/                  # Independent Evaluator Service
│   ├── evaluate.py
│   └── Dockerfile
├── frontend/                   # React + TypeScript + Vite UI
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── metrics.json                # Generated evaluation output
├── docker-compose.yml          # Container orchestration
├── REPORT.md                   # Detailed technical report
└── README.md
```

---

## 📄 Documentation

For full algorithmic details, cluster selection methodology, and failure case testing, see [REPORT.md](file:///Users/srisharadhakrishnan/streamly/REPORT.md).
