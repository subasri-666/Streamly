import os
import json
import time
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, status, Header, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.app.database.db import get_db, Base, engine
from backend.app.database.models import User, ViewerProfile, Movie, ViewerPreference, Setting, AuditLog
from backend.app.database.seed import seed_database
from backend.app.auth.security import hash_password, verify_password, create_access_token, decode_access_token
from backend.app.ml.inference import inference_service

# Initialize DB tables & seed
seed_database()

app = FastAPI(
    title="STREAMLY API",
    description="Containerized Audience Segmentation & Personalization Service API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = time.time()

# --- PYDANTIC SCHEMAS ---

class UserLoginRequest(BaseModel):
    email: str
    password: str

class RecommendRequest(BaseModel):
    user_id: Optional[str] = None
    total_watch_time_mins: Optional[float] = Field(default=1500.0)
    avg_session_duration_mins: Optional[float] = Field(default=60.0)
    number_of_sessions: Optional[int] = Field(default=25)
    viewing_frequency_per_week: Optional[float] = Field(default=6.0)
    completion_rate: Optional[float] = Field(default=0.75)
    weekend_viewing_ratio: Optional[float] = Field(default=0.40)
    genre_action_ratio: Optional[float] = None
    genre_comedy_ratio: Optional[float] = None
    genre_drama_ratio: Optional[float] = None
    genre_thriller_ratio: Optional[float] = None
    genre_scifi_ratio: Optional[float] = None
    genre_romance_ratio: Optional[float] = None
    genre_horror_ratio: Optional[float] = None
    genre_animation_ratio: Optional[float] = None
    top_genres: Optional[List[str]] = Field(default=["Action", "Thriller"])
    exploration_level: Optional[float] = Field(default=0.5, ge=0.0, le=1.0)

class UserCreateRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "VIEWER"

class PreferenceUpdateRequest(BaseModel):
    exploration_level: float = Field(..., ge=0.0, le=1.0)
    preferred_genres: List[str]

# --- DEPENDENCIES ---

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authentication token")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or disabled")
    return user

# --- REQUIRED OFFICIAL ENDPOINTS ---

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_ok = True
    try:
        db.query(Setting).first()
    except Exception:
        db_ok = False

    model_status = inference_service.is_loaded
    uptime_seconds = round(time.time() - START_TIME, 2)

    return {
        "status": "healthy" if (model_status and db_ok) else "degraded",
        "service": "Streamly API",
        "version": "1.0.0",
        "model_loaded": model_status,
        "database_connected": db_ok,
        "uptime_seconds": uptime_seconds,
        "n_clusters": inference_service.kmeans.n_clusters if model_status else None
    }

@app.post("/recommend")
def recommend_endpoint(payload: RecommendRequest, db: Session = Depends(get_db)):
    if not inference_service.is_loaded:
        # Retry loading model if not loaded
        if not inference_service.load_model():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="ML Clustering Model is loading or unavailable."
            )

    # Input sanitization and bounds checking
    profile_dict = payload.model_dump()
    
    # Handle negative / invalid values gracefully
    profile_dict["total_watch_time_mins"] = max(0.0, profile_dict.get("total_watch_time_mins") or 0.0)
    profile_dict["avg_session_duration_mins"] = max(1.0, profile_dict.get("avg_session_duration_mins") or 1.0)
    profile_dict["number_of_sessions"] = max(1, profile_dict.get("number_of_sessions") or 1)
    profile_dict["viewing_frequency_per_week"] = max(0.0, profile_dict.get("viewing_frequency_per_week") or 0.0)
    profile_dict["completion_rate"] = max(0.0, min(1.0, profile_dict.get("completion_rate") or 0.5))
    profile_dict["weekend_viewing_ratio"] = max(0.0, min(1.0, profile_dict.get("weekend_viewing_ratio") or 0.5))

    # Predict segment using persisted model
    try:
        segment_res = inference_service.predict_segment(profile_dict)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Inference error: {str(e)}")

    segment_name = segment_res["segment_name"]
    top_genres = payload.top_genres or segment_res["top_genres"] or ["Action"]
    exploration_level = payload.exploration_level if payload.exploration_level is not None else 0.5

    # Fetch candidates from SQLite catalog
    all_movies = db.query(Movie).all()
    movie_dicts = []
    for m in all_movies:
        movie_dicts.append({
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "genre": m.genre,
            "genres": m.get_genres(),
            "year": m.year,
            "rating": m.rating,
            "duration_mins": m.duration_mins,
            "poster_url": m.poster_url,
            "backdrop_url": m.backdrop_url,
            "is_trending": m.is_trending,
            "is_popular": m.is_popular
        })

    # Transparent rule-based selection logic based on exploration_level & segment
    preferred_matches = [m for m in movie_dicts if any(g in top_genres for g in m["genres"])]
    other_movies = [m for m in movie_dicts if m not in preferred_matches]

    if exploration_level <= 0.3:
        # Familiar mode: 80-90% preferred genres
        selected = preferred_matches[:5] + other_movies[:1]
    elif exploration_level >= 0.7:
        # Explore mode: 30% preferred, 70% adjacent genres
        selected = preferred_matches[:2] + other_movies[:4]
    else:
        # Balanced mode: 50% preferred, 50% other
        selected = preferred_matches[:3] + other_movies[:3]

    if not selected:
        selected = movie_dicts[:6]

    # Generate transparent recommendation reasons
    annotated_recommendations = inference_service.generate_recommendation_reasons(
        movies=selected,
        segment_name=segment_name,
        preferred_genres=top_genres,
        exploration_level=exploration_level
    )

    return {
        "status": "success",
        "user_id": payload.user_id or "anonymous",
        "segment": {
            "segment_id": segment_res["segment_id"],
            "segment_name": segment_res["segment_name"],
            "description": segment_res["description"],
            "recommendation_behavior": segment_res["recommendation_behavior"],
            "top_genres": segment_res["top_genres"],
            "dna_metrics": segment_res["dna_metrics"]
        },
        "exploration_level": exploration_level,
        "total_recommendations": len(annotated_recommendations),
        "recommendations": annotated_recommendations
    }

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/login")
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    }

@app.get("/api/auth/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "created_at": user.created_at.isoformat()
    }

# --- MOVIES & CATALOG ENDPOINTS ---

@app.get("/api/movies")
def list_movies(genre: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Movie)
    if genre:
        query = query.filter(Movie.genre == genre)
    movies = query.all()
    res = []
    for m in movies:
        res.append({
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "genre": m.genre,
            "genres": m.get_genres(),
            "year": m.year,
            "rating": m.rating,
            "duration_mins": m.duration_mins,
            "poster_url": m.poster_url,
            "backdrop_url": m.backdrop_url,
            "is_trending": m.is_trending,
            "is_popular": m.is_popular
        })
    return res

@app.get("/api/movies/{movie_id}")
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return {
        "id": movie.id,
        "title": movie.title,
        "description": movie.description,
        "genre": movie.genre,
        "genres": movie.get_genres(),
        "year": movie.year,
        "rating": movie.rating,
        "duration_mins": movie.duration_mins,
        "poster_url": movie.poster_url,
        "backdrop_url": movie.backdrop_url,
        "is_trending": movie.is_trending,
        "is_popular": movie.is_popular
    }

# --- ADMIN ENDPOINTS ---

@app.get("/api/admin/overview")
def admin_overview(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin role required")

    total_users = db.query(User).count()
    total_viewers = db.query(User).filter(User.role == "VIEWER").count()
    total_analysts = db.query(User).filter(User.role == "ANALYST").count()
    total_admins = db.query(User).filter(User.role == "ADMIN").count()
    total_movies = db.query(Movie).count()

    model_meta = inference_service.model_metadata
    segment_meta = inference_service.segment_metadata

    eval_path = "metrics.json"
    eval_status = "Generated" if os.path.exists(eval_path) else "Pending"

    return {
        "total_users": total_users,
        "total_viewers": total_viewers,
        "total_analysts": total_analysts,
        "total_admins": total_admins,
        "total_movies": total_movies,
        "n_segments": inference_service.kmeans.n_clusters if inference_service.is_loaded else 0,
        "model_status": "Active" if inference_service.is_loaded else "Inactive",
        "model_version": model_meta.get("version", "1.0.0"),
        "last_trained_at": model_meta.get("trained_at", "N/A"),
        "evaluator_status": eval_status,
        "api_health": "Healthy"
    }

@app.get("/api/admin/users")
def list_users(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin role required")
    users = db.query(User).all()
    return [{
        "id": u.id,
        "email": u.email,
        "name": u.name,
        "role": u.role,
        "is_active": u.is_active,
        "created_at": u.created_at.isoformat()
    } for u in users]

@app.post("/api/admin/users")
def create_user(req: UserCreateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin role required")
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User email already exists")

    new_user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        name=req.name,
        role=req.role.upper(),
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "created", "user_id": new_user.id}

# --- ANALYST ENDPOINTS ---

@app.get("/api/analyst/overview")
def analyst_overview(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role not in ["ADMIN", "ANALYST"]:
        raise HTTPException(status_code=403, detail="Analyst or Admin role required")

    return {
        "model_metadata": inference_service.model_metadata,
        "segment_metadata": inference_service.segment_metadata
    }

@app.get("/api/admin/evaluation")
@app.get("/api/analyst/evaluation")
def get_evaluation_metrics():
    eval_path = "metrics.json"
    if os.path.exists(eval_path):
        try:
            with open(eval_path, "r") as f:
                return json.load(f)
        except Exception as e:
            return {"error": f"Failed to read metrics.json: {str(e)}"}
    else:
        return {
            "status": "pending",
            "message": "metrics.json has not been generated by the Evaluator service yet."
        }

# --- VIEWER SPECIFIC ENDPOINTS ---

@app.get("/api/viewer/profile")
def get_viewer_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vp = db.query(ViewerProfile).filter(ViewerProfile.user_id == user.id).first()
    if not vp:
        # Create default profile for viewer
        vp = ViewerProfile(
            user_id=user.id,
            total_watch_time_mins=3150.0,
            avg_session_duration_mins=105.0,
            number_of_sessions=30,
            viewing_frequency_per_week=9.5,
            completion_rate=0.88,
            weekend_viewing_ratio=0.45,
            top_genre="Action"
        )
        db.add(vp)
        db.commit()
        db.refresh(vp)

    # Predict segment dynamically
    profile_dict = {
        "total_watch_time_mins": vp.total_watch_time_mins,
        "avg_session_duration_mins": vp.avg_session_duration_mins,
        "number_of_sessions": vp.number_of_sessions,
        "viewing_frequency_per_week": vp.viewing_frequency_per_week,
        "completion_rate": vp.completion_rate,
        "weekend_viewing_ratio": vp.weekend_viewing_ratio,
        "top_genres": [vp.top_genre]
    }
    seg_res = inference_service.predict_segment(profile_dict)

    pref = db.query(ViewerPreference).filter(ViewerPreference.user_id == user.id).first()
    exp_level = pref.exploration_level if pref else 0.5

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        },
        "metrics": profile_dict,
        "segment": seg_res,
        "exploration_level": exp_level
    }

# --- STATIC FILES FOR REACT BUILD ---
static_dir = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path in ["health", "recommend"]:
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(static_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))
