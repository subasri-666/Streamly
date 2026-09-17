import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List

FEATURE_COLS = [
    "total_watch_time_mins",
    "avg_session_duration_mins",
    "number_of_sessions",
    "viewing_frequency_per_week",
    "completion_rate",
    "weekend_viewing_ratio",
    "genre_action_ratio",
    "genre_comedy_ratio",
    "genre_drama_ratio",
    "genre_thriller_ratio",
    "genre_scifi_ratio",
    "genre_romance_ratio",
    "genre_horror_ratio",
    "genre_animation_ratio"
]

GENRE_MAP = {
    "genre_action_ratio": "Action",
    "genre_comedy_ratio": "Comedy",
    "genre_drama_ratio": "Drama",
    "genre_thriller_ratio": "Thriller",
    "genre_scifi_ratio": "Sci-Fi",
    "genre_romance_ratio": "Romance",
    "genre_horror_ratio": "Horror",
    "genre_animation_ratio": "Animation"
}

class ModelInferenceService:
    def __init__(self, models_dir="models"):
        self.models_dir = models_dir
        self.pipeline = None
        self.scaler = None
        self.kmeans = None
        self.segment_metadata = {}
        self.model_metadata = {}
        self.is_loaded = False

        self.load_model()

    def load_model(self):
        pipeline_path = os.path.join(self.models_dir, "pipeline.joblib")
        seg_meta_path = os.path.join(self.models_dir, "segment_metadata.json")
        mod_meta_path = os.path.join(self.models_dir, "model_metadata.json")

        if not os.path.exists(pipeline_path):
            print(f"[ML INFERENCE] Warning: Pipeline artifact not found at {pipeline_path}")
            return False

        try:
            artifact = joblib.load(pipeline_path)
            self.scaler = artifact["scaler"]
            self.kmeans = artifact["kmeans"]
            
            if os.path.exists(seg_meta_path):
                with open(seg_meta_path, "r") as f:
                    self.segment_metadata = json.load(f)

            if os.path.exists(mod_meta_path):
                with open(mod_meta_path, "r") as f:
                    self.model_metadata = json.load(f)

            self.is_loaded = True
            print(f"[ML INFERENCE] Successfully loaded persisted model pipeline with {self.kmeans.n_clusters} clusters.")
            return True
        except Exception as e:
            print(f"[ML INFERENCE] Error loading model pipeline: {e}")
            self.is_loaded = False
            return False

    def predict_segment(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_loaded:
            # Attempt reloading
            if not self.load_model():
                raise RuntimeError("ML model pipeline is not loaded or artifact is missing.")

        # Extract features from input payload with fallbacks and sanitization
        feature_vector = []
        
        # If raw genre list is provided, calculate ratios
        top_genres_input = profile_data.get("top_genres", [])
        if isinstance(top_genres_input, str):
            top_genres_input = [top_genres_input]

        genre_ratios_calc = {}
        if top_genres_input and len(top_genres_input) > 0:
            count = len(top_genres_input)
            for col, genre_name in GENRE_MAP.items():
                if genre_name in top_genres_input:
                    genre_ratios_calc[col] = round(1.0 / count, 3)
                else:
                    genre_ratios_calc[col] = 0.05 / max(1, count)
        
        for col in FEATURE_COLS:
            if col in profile_data and profile_data[col] is not None:
                val = profile_data[col]
            elif col in genre_ratios_calc:
                val = genre_ratios_calc[col]
            else:
                # Default fallback value
                val = 0.5 if "ratio" in col or "rate" in col else 50.0
            
            try:
                feature_vector.append(float(val))
            except (ValueError, TypeError):
                feature_vector.append(0.0)

        # Scale and predict
        X = np.array([feature_vector])
        X_scaled = self.scaler.transform(X)
        segment_id = int(self.kmeans.predict(X_scaled)[0])

        seg_info = self.segment_metadata.get(str(segment_id), {
            "name": f"Segment #{segment_id}",
            "description": "Viewer segment discovered by KMeans.",
            "top_genres": ["Action", "Sci-Fi"],
            "dna_metrics": {"engagement": 75, "session_pattern": 70, "genre_affinity": 80, "exploration": 50}
        })

        return {
            "segment_id": segment_id,
            "segment_name": seg_info.get("name"),
            "description": seg_info.get("description"),
            "recommendation_behavior": seg_info.get("recommendation_behavior"),
            "top_genres": seg_info.get("top_genres", []),
            "dna_metrics": seg_info.get("dna_metrics", {}),
            "input_features": dict(zip(FEATURE_COLS, feature_vector))
        }

    def generate_recommendation_reasons(self, movies: List[Dict[str, Any]], segment_name: str, preferred_genres: List[str], exploration_level: float) -> List[Dict[str, Any]]:
        annotated_movies = []
        
        for idx, movie in enumerate(movies):
            movie_dict = dict(movie)
            m_genres = movie_dict.get("genres", [movie_dict.get("genre")])
            m_genre = movie_dict.get("genre")

            # Deterministic reason matching
            if any(g in preferred_genres for g in m_genres):
                reason = f"Matches your strong affinity for {m_genre}."
            elif "Action" in segment_name and m_genre in ["Action", "Thriller"]:
                reason = f"Aligned with your {segment_name} viewing pattern."
            elif "Short-Session" in segment_name and movie_dict.get("duration_mins", 120) < 100:
                reason = f"Ideal for quick watching ({movie_dict.get('duration_mins')} mins) based on your casual profile."
            elif exploration_level > 0.6:
                reason = f"Curated exploration pick to expand your {m_genre} horizons."
            else:
                reason = f"Trending top recommendation for your segment."

            movie_dict["recommendation_reason"] = reason
            annotated_movies.append(movie_dict)

        return annotated_movies

# Global instance singleton
inference_service = ModelInferenceService()
