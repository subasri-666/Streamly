# STREAMLY — Technical Report & Hackathon Solution Documentation

**Project Title:** STREAMLY — Containerized Audience Segmentation & Personalization Service  
**Tagline:** "Understand Your Watch. Discover Your Next."  
**Category:** AI-Powered OTT Audience Segmentation and Personalization Platform  
**Target Repository:** [https://github.com/subasri-666/Streamly](https://github.com/subasri-666/Streamly)  

---

## 1. Problem Understanding

Modern OTT platforms process massive streams of raw viewer telemetry: watch time, session lengths, frequency of visits, completion rates, and genre affinities. Raw telemetry data cannot be directly used for real-time content recommendation decisions without structured representation. Manual audience labeling is unfeasible at scale.

STREAMLY solves this by building an end-to-end, lightweight machine learning service that automatically discovers meaningful behavioral audience segments using unsupervised machine learning ($K$-Means clustering with `StandardScaler`). The system exposes these segments via a containerized REST API (`/recommend`), independently validates system quality via an evaluator service producing `metrics.json`, and delivers a cinematic OTT experience alongside data-driven Admin and Analyst dashboards.

---

## 2. Key System Assumptions

1. **Unsupervised ML Primacy:** Audience clusters are discovered organically from tabular viewer behavioral data without artificial supervised labels.
2. **Inference Pipeline Persistence:** The preprocessing (`StandardScaler`) and clustering (`KMeans`) components are trained by a dedicated `trainer` service, persisted to `/models/pipeline.joblib`, and loaded by the `api` service at startup. **The API never retrains the model per incoming request.**
3. **Dual Data Architecture:**
   - **ML Training Source:** Tabular viewer telemetry data (`data/ott_viewer_activity.csv`).
   - **Application State Database:** Lightweight SQLite database (`database/streamly.db`) storing user credentials, role permissions, viewer preferences, and movie catalog metadata.
4. **Lightweight & CPU-Friendly:** Inference and evaluation require zero GPU acceleration and no heavy Large Language Models (LLMs).

---

## 3. Dataset Description

The system processes an OTT viewer activity dataset (`data/ott_viewer_activity.csv`) containing 1,200 viewer activity records with 16 telemetry dimensions:
- `user_id`: Unique identifier (e.g., `USR-1001`)
- `total_watch_time_mins`: Cumulative watch time in minutes (Range: 10 - 8,000 mins)
- `avg_session_duration_mins`: Average session length in minutes (Range: 5 - 300 mins)
- `number_of_sessions`: Total session count (Range: 1 - 200)
- `viewing_frequency_per_week`: Average weekly visits (Range: 0.2 - 21.0)
- `completion_rate`: Ratio of content finished to started (Range: 0.05 - 1.0)
- `weekend_viewing_ratio`: Proportion of watch time spent on weekends (Range: 0.0 - 1.0)
- `genre_*_ratio`: Fractional affinity across 8 genres (`genre_action_ratio`, `genre_comedy_ratio`, `genre_drama_ratio`, `genre_thriller_ratio`, `genre_scifi_ratio`, `genre_romance_ratio`, `genre_horror_ratio`, `genre_animation_ratio`)
- `top_genre`: Primary genre category string

---

## 4. Data Preprocessing & Cleaning

1. **Validation & Type Casting:** Features are explicitly coerced to floating-point numbers. Missing or corrupted entries are imputed using feature medians.
2. **Outlier & Range Clipping:**
   - `total_watch_time_mins` clipped to $[0, 20,000]$
   - `avg_session_duration_mins` clipped to $[1, 600]$
   - Ratios (`completion_rate`, `weekend_viewing_ratio`, `genre_*_ratio`) bounded to $[0.0, 1.0]$
3. **Genre Normalization:** Genre ratio vectors are normalized per row to guarantee $\sum \text{ratio}_i = 1.0$.

---

## 5. Feature Selection

14 continuous numerical features were selected for clustering vector formation:
$$\mathbf{x}_i = \big[ \text{watch\_time}, \text{session\_dur}, \text{sessions}, \text{frequency}, \text{completion}, \text{weekend\_ratio}, \text{action\_ratio}, \dots, \text{animation\_ratio} \big]^T$$

---

## 6. Feature Selection Rationale

- **Engagement Scale:** `total_watch_time_mins` and `viewing_frequency_per_week` separate heavy power users from casual or low-activity viewers.
- **Consumption Style:** `avg_session_duration_mins` distinguishes quick short-form viewers from binge-watchers.
- **Content Preferences:** Explicit genre ratio dimensions capture content taste profiles without high-cardinality categorical one-hot explosion.

---

## 7. Model Choice

- **Algorithm:** $K$-Means Clustering (`sklearn.cluster.KMeans`) combined with `sklearn.preprocessing.StandardScaler`.
- **Justification:** $K$-Means is computationally efficient ($\mathcal{O}(n \cdot k \cdot d)$ complexity), deterministic with fixed random seeds (`random_state=42`), lightweight on CPU resources, and directly interpretable via cluster centroid vectors.

---

## 8. Hyperparameters

- `n_clusters`: $K = 4$ (determined via Silhouette & Inertia analysis)
- `init`: `'k-means++'`
- `n_init`: 10
- `max_iter`: 300
- `random_state`: 42

---

## 9. Cluster Selection Methodology

We evaluated cluster counts $K \in \{2, 3, 4, 5, 6\}$ across two complementary quantitative indicators:
1. **Silhouette Score:** Measures intra-cluster cohesion versus nearest-cluster separation.
2. **Inertia (Sum of Squared Errors):** Measures compactness within clusters.

---

## 10. Silhouette & Inertia Results

| $K$ Clusters | Silhouette Score | Inertia (SSE) | Rationale / Decision |
| :---: | :---: | :---: | :--- |
| $K=2$ | 0.4449 | 8,816.49 | Under-segments distinct viewing behaviors |
| $K=3$ | 0.5182 | 5,299.40 | Good separation, missing exploration niche |
| **$K=4$** | **0.5428** | **2,968.28** | **Peak Silhouette score & sharp inertia elbow point** |
| $K=5$ | 0.4610 | 2,820.65 | Fragmented clusters with overlapping centroids |
| $K=6$ | 0.3583 | 2,684.82 | Over-clustering, lower silhouette quality |

---

## 11. Cluster Profiles & Centroid Statistics

| Cluster ID | Segment Name | Size (%) | Avg Watch Time | Avg Session | Dominant Genres |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **0** | High-Engagement Action Viewers | 360 (30.0%) | 3,240 mins | 108 mins | Action (45%), Thriller (30%) |
| **1** | Casual Short-Session Viewers | 300 (25.0%) | 860 mins | 26 mins | Comedy (40%), Animation (30%) |
| **2** | Genre Explorers | 300 (25.0%) | 2,120 mins | 64 mins | Drama (25%), Sci-Fi (20%), Comedy (18%) |
| **3** | Low-Activity Viewers | 240 (20.0%) | 360 mins | 41 mins | Drama (45%), Romance (30%) |

---

## 12. Segment Naming Logic

Segment names are generated dynamically by inspecting cluster centroid statistics against empirical domain thresholds:
- High watch time ($> 2,500$ mins) & long sessions ($> 80$ mins) $\rightarrow$ **High-Engagement Action Viewers**
- Short sessions ($< 45$ mins) & high frequency ($> 5$ visits/wk) $\rightarrow$ **Casual Short-Session Viewers**
- Low total watch time ($< 800$ mins) & low frequency ($< 4$ visits/wk) $\rightarrow$ **Low-Activity Viewers**
- High genre entropy across multiple categories $\rightarrow$ **Genre Explorers**

---

## 13. Transparent Rule-Based Recommendation Methodology

STREAMLY uses a transparent, rule-based recommendation mapping:
- **High-Engagement Action Viewers:** Prioritize Action, Thriller, and Sci-Fi blockbusters.
- **Casual Short-Session Viewers:** Prioritize short films, comedies, and bite-sized animations ($< 100$ mins).
- **Genre Explorers:** Mix top preferred genres with curated adjacent genre picks.
- **Low-Activity Viewers:** Surface top-rated trending platform hits to maximize initial engagement.

The **Familiar ↔ Explore** slider dynamically adjusts the ratio of preferred vs. adjacent genre candidates ($0.0 = \text{90\% Preferred}$, $0.5 = \text{50/50 Mix}$, $1.0 = \text{70\% Exploration}$).

---

## 14. API Design

- `GET /health`: Health readiness monitoring (`status`, `model_loaded`, `database_connected`, `uptime_seconds`).
- `POST /recommend`: Main inference endpoint accepting viewer activity profiles and returning segment predictions, segment metadata, and transparently reasoned movie recommendations.
- `POST /api/auth/login`: Authenticates users and returns JWT tokens.
- Admin & Analyst Endpoints: User management, model metadata, and `metrics.json` evaluation viewer.

---

## 15. Authentication & Role Security

- Role-based Access Control (RBAC) with 3 roles: `ADMIN`, `ANALYST`, `VIEWER`.
- Password security: SHA-256 + HMAC salting (no plaintext passwords).
- Authorization: HTTP Bearer JWT tokens with 24-hour expiration.

---

## 16. Database Architecture

- Engine: SQLite (`database/streamly.db`) via SQLAlchemy ORM.
- Tables: `users`, `viewer_profiles`, `movies`, `user_lists`, `viewer_preferences`, `recommendation_history`, `settings`, `audit_logs`.
- Pre-seeded with 3 demo role accounts and 20 high-definition movie catalog items.

---

## 17. Docker Container Architecture

`docker-compose.yml` orchestrates 3 required services:
1. `trainer`: Executes data preprocessing, trains $K$-Means ($K=4$), and persists pipeline artifacts to shared volume `./models:/models`.
2. `api`: Depends on `trainer` completion. Loads `/models/pipeline.joblib`, exposes REST API on port 8000, and serves the production React build.
3. `evaluator`: Depends on `api` health (`condition: service_healthy`). Runs test suite and outputs `metrics.json`.

---

## 18. Independent Evaluator Methodology

The `evaluator/evaluate.py` service polls `/health` until ready, then executes a 9-part test battery covering:
- API readiness & response latency
- Valid profile recommendations
- Missing field handling & string type coercions
- Negative numeric value sanitization
- Empty & unknown genre resilience
- Extreme value clipping
- Reproducibility & determinism checks
- Output generation: Writes machine-readable `metrics.json` to root directory.

---

## 19. metrics.json Output Verification

```json
{
  "timestamp": "2026-09-17T13:10:27.877812+00:00",
  "evaluator_status": "COMPLETED",
  "overall_result": "PASS",
  "test_summary": {
    "total_tests": 9,
    "passed": 9,
    "failed": 0,
    "pass_rate_percentage": 100.0
  },
  "clustering_quality": {
    "algorithm": "KMeans",
    "scaler": "StandardScaler",
    "n_clusters": 4,
    "silhouette_score": 0.5428,
    "inertia": 2968.28,
    "cluster_balance_ratio": 0.667
  },
  "api_performance": {
    "health_status": "HEALTHY",
    "average_latency_ms": 17.13,
    "reproducible": true
  }
}
```

---

## 20. Edge Cases Tested

1. **Unknown Genre Values:** Gracefully defaults to balanced fallback recommendations.
2. **Negative Watch Times:** Sanitized and bounded to $\ge 0$.
3. **Missing Fields:** Imputed using pre-calculated feature medians.
4. **Extreme Numeric Inputs:** Clipped to upper boundary limits without throwing 500 errors.

---

## 21. Summary of Results

- **Machine Learning:** $K=4$ clusters discovered with Silhouette Score **0.5428** and clean cluster balance ratio **0.667**.
- **API Performance:** Average recommendation inference latency **17.13 ms** per request.
- **Evaluator Pass Rate:** **100.0%** across 9 automated test suites.

---

## 22. Platform Limitations

- **Dataset Size:** Trained on 1,200 records; scaling to 10M+ active daily viewers would benefit from distributed Spark / MiniBatchKMeans processing.
- **Temporal Dynamics:** Sequential viewing order is not tracked; recommendations rely on aggregated telemetry vectors.

---

## 23. Future Improvements

1. **MiniBatchKMeans / Incremental Training:** Enable online centroid updates for large streaming workloads.
2. **Collaborative Filtering Hybrid:** Combine unsupervised behavioral clustering with matrix factorization (ALS/SVD) for hybrid recommendations.

---

## 24. Reproducibility Instructions

1. Clone repository:
   ```bash
   git clone https://github.com/subasri-666/Streamly.git
   cd Streamly
   ```
2. One-Command Startup with Docker Compose:
   ```bash
   docker compose up --build
   ```
3. Access Web Interface:
   - Open `http://localhost:8000` in browser.

---

## 25. Development Process Notes

- Built in modular stages: Data Generation $\rightarrow$ ML Pipeline Trainer $\rightarrow$ FastAPI Backend $\rightarrow$ Evaluator Suite $\rightarrow$ React Frontend $\rightarrow$ Docker Compose Packaging.
- All 3 role workflows (`ADMIN`, `ANALYST`, `VIEWER`) verified.
