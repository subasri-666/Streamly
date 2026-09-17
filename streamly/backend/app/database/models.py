import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="VIEWER") # ADMIN, ANALYST, VIEWER
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    viewer_profile = relationship("ViewerProfile", back_populates="user", uselist=False)
    preferences = relationship("ViewerPreference", back_populates="user", uselist=False)

class ViewerProfile(Base):
    __tablename__ = "viewer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    total_watch_time_mins = Column(Float, default=1500.0)
    avg_session_duration_mins = Column(Float, default=60.0)
    number_of_sessions = Column(Integer, default=25)
    viewing_frequency_per_week = Column(Float, default=6.0)
    completion_rate = Column(Float, default=0.75)
    weekend_viewing_ratio = Column(Float, default=0.4)
    top_genre = Column(String, default="Action")
    segment_id = Column(Integer, default=0)
    segment_name = Column(String, default="Unassigned")
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="viewer_profile")

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    genre = Column(String, nullable=False)
    genres_json = Column(Text, nullable=False) # JSON list e.g. ["Action", "Sci-Fi"]
    year = Column(Integer, nullable=False)
    rating = Column(Float, default=8.0)
    duration_mins = Column(Integer, default=120)
    poster_url = Column(String, nullable=False)
    backdrop_url = Column(String, nullable=False)
    is_trending = Column(Boolean, default=False)
    is_popular = Column(Boolean, default=False)
    tags_json = Column(Text, default="[]")

    def get_genres(self):
        try:
            return json.loads(self.genres_json)
        except Exception:
            return [self.genre]

class UserList(Base):
    __tablename__ = "user_lists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)
    added_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ViewerPreference(Base):
    __tablename__ = "viewer_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    exploration_level = Column(Float, default=0.5) # 0.0=Familiar, 1.0=Explore
    preferred_genres_json = Column(Text, default='["Action", "Thriller"]')

    user = relationship("User", back_populates="preferences")

class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    segment_name = Column(String, nullable=False)
    recommended_movie_ids_json = Column(Text, nullable=False)
    exploration_level = Column(Float, default=0.5)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    value_json = Column(Text, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
