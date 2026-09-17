import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

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

def load_and_validate_data(data_path):
    print(f"[TRAINER] Loading dataset from: {data_path}")
    if not os.path.exists(data_path):
        # Fallback search path
        fallback = "data/ott_viewer_activity.csv"
        if os.path.exists(fallback):
            data_path = fallback
        else:
            raise FileNotFoundError(f"Dataset not found at {data_path} or {fallback}")

    df = pd.read_csv(data_path)
    print(f"[TRAINER] Loaded dataset shape: {df.shape}")

    # Validate and clean required feature columns
    for col in FEATURE_COLS:
        if col not in df.columns:
            raise ValueError(f"Missing required feature column: {col}")
        
    # Data cleaning: clip non-sensical values, fill missing
    df[FEATURE_COLS] = df[FEATURE_COLS].apply(pd.to_numeric, errors='coerce')
    df[FEATURE_COLS] = df[FEATURE_COLS].fillna(df[FEATURE_COLS].median())
    
    # Range bounds validation
    df['total_watch_time_mins'] = np.clip(df['total_watch_time_mins'], 0, 20000)
    df['avg_session_duration_mins'] = np.clip(df['avg_session_duration_mins'], 1, 600)
    df['number_of_sessions'] = np.clip(df['number_of_sessions'], 1, 1000)
    df['viewing_frequency_per_week'] = np.clip(df['viewing_frequency_per_week'], 0, 50)
    df['completion_rate'] = np.clip(df['completion_rate'], 0.0, 1.0)
    df['weekend_viewing_ratio'] = np.clip(df['weekend_viewing_ratio'], 0.0, 1.0)

    return df

def generate_segment_name_and_metadata(centroid, cluster_size, total_samples):
    # Centroid values for key dimensions
    watch_time = centroid[0]
    session_dur = centroid[1]
    sessions = centroid[2]
    frequency = centroid[3]
    completion = centroid[4]
    
    # Genre ratios
    genre_ratios = {
        GENRE_MAP[col]: centroid[idx] for idx, col in enumerate(FEATURE_COLS) if col in GENRE_MAP
    }
    sorted_genres = sorted(genre_ratios.items(), key=lambda x: x[1], reverse=True)
    top_genre, top_genre_ratio = sorted_genres[0]
    second_genre, second_genre_ratio = sorted_genres[1]

    # Name logic based on actual centroid statistics
    if watch_time > 2500 and session_dur > 80:
        name = f"High-Engagement {top_genre} Viewers"
        desc = f"Power users with extensive watch time (avg {int(watch_time)} mins) and long sessions ({int(session_dur)} mins). Strongly prefer {top_genre} and {second_genre}."
        rec_behavior = f"Prioritize deep {top_genre} and {second_genre} blockbusters and exclusive series."
    elif session_dur < 45 and frequency > 5.0:
        name = f"Casual Short-Session Viewers"
        desc = f"Frequent viewers ({frequency:.1f} visits/wk) who prefer quick sessions (avg {int(session_dur)} mins). High affinity for {top_genre} and {second_genre}."
        rec_behavior = f"Prioritize short-form content, trending short films, and bite-sized comedy/animation."
    elif watch_time < 800 and frequency < 4.0:
        name = f"Low-Activity Viewers"
        desc = f"Occasional viewers with lower overall watch time (avg {int(watch_time)} mins). Mainly watch {top_genre} content."
        rec_behavior = f"Surface top-rated popular hits and low-friction introductory movies to boost engagement."
    else:
        name = f"Genre Explorers"
        desc = f"Active viewers with diverse taste across multiple genres ({top_genre}, {second_genre}). Balanced session lengths ({int(session_dur)} mins)."
        rec_behavior = f"Recommend a mix of preferred {top_genre} titles with curated exploration of adjacent genres."

    # Segment DNA calculation from centroid
    engagement_score = min(100, int((watch_time / 3500) * 60 + (frequency / 10) * 40))
    session_score = min(100, int((session_dur / 120) * 100))
    genre_affinity_score = min(100, int(top_genre_ratio * 200))
    exploration_score = min(100, int((1 - top_genre_ratio) * 150))

    return {
        "name": name,
        "description": desc,
        "size": int(cluster_size),
        "percentage": round(float((cluster_size / total_samples) * 100), 1),
        "recommendation_behavior": rec_behavior,
        "top_genres": [top_genre, second_genre],
        "dominant_genre_ratios": {g: round(float(r), 3) for g, r in sorted_genres[:4]},
        "centroid_summary": {
            "avg_watch_time_mins": round(float(watch_time), 1),
            "avg_session_duration_mins": round(float(session_dur), 1),
            "avg_sessions": round(float(sessions), 1),
            "viewing_frequency_per_week": round(float(frequency), 1),
            "completion_rate": round(float(completion), 2)
        },
        "dna_metrics": {
            "engagement": engagement_score,
            "session_pattern": session_score,
            "genre_affinity": genre_affinity_score,
            "exploration": exploration_score
        }
    }

def main():
    data_path = os.environ.get("DATA_PATH", "data/ott_viewer_activity.csv")
    output_dir = os.environ.get("MODELS_DIR", "models")
    os.makedirs(output_dir, exist_ok=True)

    df = load_and_validate_data(data_path)
    X = df[FEATURE_COLS].values

    # Step 1: Feature Scaling
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Step 2: Optimal K Selection (K=2 to 6)
    k_evaluations = []
    best_k = 4
    best_silhouette = -1
    best_inertia = float('inf')

    print("[TRAINER] Evaluating cluster numbers K from 2 to 6...")
    for k in range(2, 7):
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(X_scaled)
        sil = float(silhouette_score(X_scaled, labels))
        inertia = float(km.inertia_)
        k_evaluations.append({
            "k": k,
            "silhouette_score": round(sil, 4),
            "inertia": round(inertia, 2)
        })
        print(f"  K={k} -> Silhouette: {sil:.4f}, Inertia: {inertia:.2f}")

        # Choose K with highest silhouette score
        if sil > best_silhouette:
            best_silhouette = sil
            best_k = k

    print(f"[TRAINER] Selected K={best_k} with Silhouette Score: {best_silhouette:.4f}")

    # Step 3: Train final KMeans model
    final_kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
    labels = final_kmeans.fit_predict(X_scaled)
    final_inertia = float(final_kmeans.inertia_)

    # Un-scale centroids to original feature space for interpretation
    centroids_orig = scaler.inverse_transform(final_kmeans.cluster_centers_)

    # Step 4: Generate Segment Metadata
    segment_metadata = {}
    for i in range(best_k):
        c_mask = (labels == i)
        c_size = np.sum(c_mask)
        seg_meta = generate_segment_name_and_metadata(centroids_orig[i], c_size, len(X))
        seg_meta["segment_id"] = i
        segment_metadata[str(i)] = seg_meta

    # Step 5: Save persisted artifacts
    pipeline_artifact = {
        "scaler": scaler,
        "kmeans": final_kmeans,
        "feature_cols": FEATURE_COLS,
        "n_clusters": best_k,
        "trained_at": datetime.now(timezone.utc).isoformat()
    }

    model_metadata = {
        "algorithm": "KMeans",
        "scaling_method": "StandardScaler",
        "n_clusters": best_k,
        "random_seed": 42,
        "features": FEATURE_COLS,
        "training_samples": len(df),
        "silhouette_score": round(best_silhouette, 4),
        "inertia": round(final_inertia, 2),
        "k_evaluations": k_evaluations,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    }

    pipeline_path = os.path.join(output_dir, "pipeline.joblib")
    seg_meta_path = os.path.join(output_dir, "segment_metadata.json")
    mod_meta_path = os.path.join(output_dir, "model_metadata.json")

    joblib.dump(pipeline_artifact, pipeline_path)
    with open(seg_meta_path, "w") as f:
        json.dump(segment_metadata, f, indent=2)
    with open(mod_meta_path, "w") as f:
        json.dump(model_metadata, f, indent=2)

    print(f"[TRAINER] Pipeline saved to: {pipeline_path}")
    print(f"[TRAINER] Segment metadata saved to: {seg_meta_path}")
    print(f"[TRAINER] Model metadata saved to: {mod_meta_path}")
    print("[TRAINER] Training completed successfully!")

if __name__ == "__main__":
    main()
