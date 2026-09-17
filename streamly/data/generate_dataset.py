import numpy as np
import pandas as pd

def generate_ott_dataset(filename="data/ott_viewer_activity.csv", n_samples=1200, seed=42):
    np.random.seed(seed)
    
    # Define 4 core behavioral archetypes with noise to make realistic data
    # Cluster 1: High-Engagement Action/Thriller Viewers (~30%)
    n1 = int(n_samples * 0.30)
    c1_watch_time = np.random.normal(3200, 400, n1)
    c1_session_dur = np.random.normal(110, 15, n1)
    c1_sessions = np.random.normal(30, 5, n1)
    c1_frequency = np.random.normal(9.5, 1.5, n1)
    c1_completion = np.random.normal(0.85, 0.08, n1)
    c1_weekend_ratio = np.random.normal(0.45, 0.10, n1)
    # Genres: Action, Thriller, Sci-Fi dominant
    c1_action = np.random.normal(0.45, 0.08, n1)
    c1_thriller = np.random.normal(0.30, 0.06, n1)
    c1_scifi = np.random.normal(0.15, 0.04, n1)
    c1_comedy = np.random.normal(0.04, 0.02, n1)
    c1_drama = np.random.normal(0.03, 0.02, n1)
    c1_romance = np.random.normal(0.01, 0.01, n1)
    c1_horror = np.random.normal(0.01, 0.01, n1)
    c1_animation = np.random.normal(0.01, 0.01, n1)

    # Cluster 2: Casual Short-Session Comedy/Animation Viewers (~25%)
    n2 = int(n_samples * 0.25)
    c2_watch_time = np.random.normal(850, 150, n2)
    c2_session_dur = np.random.normal(25, 5, n2)
    c2_sessions = np.random.normal(34, 6, n2)
    c2_frequency = np.random.normal(7.0, 1.2, n2)
    c2_completion = np.random.normal(0.65, 0.10, n2)
    c2_weekend_ratio = np.random.normal(0.55, 0.12, n2)
    c2_comedy = np.random.normal(0.40, 0.08, n2)
    c2_animation = np.random.normal(0.30, 0.06, n2)
    c2_romance = np.random.normal(0.15, 0.04, n2)
    c2_action = np.random.normal(0.05, 0.02, n2)
    c2_thriller = np.random.normal(0.04, 0.02, n2)
    c2_drama = np.random.normal(0.04, 0.02, n2)
    c2_scifi = np.random.normal(0.01, 0.01, n2)
    c2_horror = np.random.normal(0.01, 0.01, n2)

    # Cluster 3: Genre Explorers (~25%)
    n3 = int(n_samples * 0.25)
    c3_watch_time = np.random.normal(2100, 300, n3)
    c3_session_dur = np.random.normal(65, 12, n3)
    c3_sessions = np.random.normal(32, 5, n3)
    c3_frequency = np.random.normal(8.0, 1.5, n3)
    c3_completion = np.random.normal(0.78, 0.08, n3)
    c3_weekend_ratio = np.random.normal(0.38, 0.09, n3)
    # Balanced genres
    c3_drama = np.random.normal(0.25, 0.05, n3)
    c3_scifi = np.random.normal(0.20, 0.04, n3)
    c3_comedy = np.random.normal(0.18, 0.04, n3)
    c3_action = np.random.normal(0.15, 0.04, n3)
    c3_thriller = np.random.normal(0.12, 0.03, n3)
    c3_romance = np.random.normal(0.05, 0.02, n3)
    c3_horror = np.random.normal(0.03, 0.01, n3)
    c3_animation = np.random.normal(0.02, 0.01, n3)

    # Cluster 4: Low-Activity Drama/Romance Viewers (~20%)
    n4 = n_samples - n1 - n2 - n3
    c4_watch_time = np.random.normal(350, 90, n4)
    c4_session_dur = np.random.normal(40, 10, n4)
    c4_sessions = np.random.normal(9, 3, n4)
    c4_frequency = np.random.normal(2.1, 0.6, n4)
    c4_completion = np.random.normal(0.45, 0.12, n4)
    c4_weekend_ratio = np.random.normal(0.65, 0.15, n4)
    c4_drama = np.random.normal(0.45, 0.08, n4)
    c4_romance = np.random.normal(0.30, 0.06, n4)
    c4_comedy = np.random.normal(0.15, 0.04, n4)
    c4_action = np.random.normal(0.04, 0.02, n4)
    c4_thriller = np.random.normal(0.03, 0.01, n4)
    c4_scifi = np.random.normal(0.01, 0.01, n4)
    c4_horror = np.random.normal(0.01, 0.01, n4)
    c4_animation = np.random.normal(0.01, 0.01, n4)

    # Combine arrays
    watch_time = np.clip(np.concatenate([c1_watch_time, c2_watch_time, c3_watch_time, c4_watch_time]), 10, 8000)
    session_dur = np.clip(np.concatenate([c1_session_dur, c2_session_dur, c3_session_dur, c4_session_dur]), 5, 300)
    sessions = np.clip(np.concatenate([c1_sessions, c2_sessions, c3_sessions, c4_sessions]), 1, 200).astype(int)
    frequency = np.clip(np.concatenate([c1_frequency, c2_frequency, c3_frequency, c4_frequency]), 0.2, 21.0)
    completion = np.clip(np.concatenate([c1_completion, c2_completion, c3_completion, c4_completion]), 0.05, 1.0)
    weekend_ratio = np.clip(np.concatenate([c1_weekend_ratio, c2_weekend_ratio, c3_weekend_ratio, c4_weekend_ratio]), 0.0, 1.0)

    # Combine genre matrices and normalize each row to sum to 1.0
    action = np.concatenate([c1_action, c2_action, c3_action, c4_action])
    comedy = np.concatenate([c1_comedy, c2_comedy, c3_comedy, c4_comedy])
    drama = np.concatenate([c1_drama, c2_drama, c3_drama, c4_drama])
    thriller = np.concatenate([c1_thriller, c2_thriller, c3_thriller, c4_thriller])
    scifi = np.concatenate([c1_scifi, c2_scifi, c3_scifi, c4_scifi])
    romance = np.concatenate([c1_romance, c2_romance, c3_romance, c4_romance])
    horror = np.concatenate([c1_horror, c2_horror, c3_horror, c4_horror])
    animation = np.concatenate([c1_animation, c2_animation, c3_animation, c4_animation])

    genre_matrix = np.column_stack([action, comedy, drama, thriller, scifi, romance, horror, animation])
    genre_matrix = np.clip(genre_matrix, 0.0, 1.0)
    genre_sums = genre_matrix.sum(axis=1, keepdims=True)
    genre_matrix = genre_matrix / genre_sums

    genres_list = ["Action", "Comedy", "Drama", "Thriller", "Sci-Fi", "Romance", "Horror", "Animation"]
    top_genres = [genres_list[i] for i in genre_matrix.argmax(axis=1)]

    user_ids = [f"USR-{1000 + i}" for i in range(n_samples)]

    df = pd.DataFrame({
        "user_id": user_ids,
        "total_watch_time_mins": np.round(watch_time, 1),
        "avg_session_duration_mins": np.round(session_dur, 1),
        "number_of_sessions": sessions,
        "viewing_frequency_per_week": np.round(frequency, 1),
        "completion_rate": np.round(completion, 2),
        "weekend_viewing_ratio": np.round(weekend_ratio, 2),
        "genre_action_ratio": np.round(genre_matrix[:, 0], 3),
        "genre_comedy_ratio": np.round(genre_matrix[:, 1], 3),
        "genre_drama_ratio": np.round(genre_matrix[:, 2], 3),
        "genre_thriller_ratio": np.round(genre_matrix[:, 3], 3),
        "genre_scifi_ratio": np.round(genre_matrix[:, 4], 3),
        "genre_romance_ratio": np.round(genre_matrix[:, 5], 3),
        "genre_horror_ratio": np.round(genre_matrix[:, 6], 3),
        "genre_animation_ratio": np.round(genre_matrix[:, 7], 3),
        "top_genre": top_genres
    })

    df.to_csv(filename, index=False)
    print(f"Dataset generated with {len(df)} records at {filename}")

if __name__ == "__main__":
    generate_ott_dataset()
