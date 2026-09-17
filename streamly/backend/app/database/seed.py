import json
import os
from backend.app.auth.security import hash_password
from backend.app.database.db import engine, SessionLocal, Base
from backend.app.database.models import User, ViewerProfile, Movie, ViewerPreference, Setting, AuditLog

SEED_MOVIES = [
    {
        "title": "CyberPulse: Nexus 2099",
        "description": "In a neon-drenched dystopian metropolis, a rogue hacker unravels a shadowy syndicate controlling mind-stream neural networks.",
        "genre": "Sci-Fi",
        "genres": ["Sci-Fi", "Action", "Thriller"],
        "year": 2026,
        "rating": 9.1,
        "duration_mins": 142,
        "poster_url": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
        "is_trending": True,
        "is_popular": True,
        "tags": ["Cyberpunk", "Futuristic", "High-Octane"]
    },
    {
        "title": "Shadow Strike: Apex",
        "description": "An elite covert operative must break out of an orbital black site to prevent a global satellite weapon activation.",
        "genre": "Action",
        "genres": ["Action", "Thriller"],
        "year": 2025,
        "rating": 8.8,
        "duration_mins": 128,
        "poster_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
        "is_trending": True,
        "is_popular": True,
        "tags": ["Action", "Espionage", "Adrenaline"]
    },
    {
        "title": "The Quantum Paradigm",
        "description": "A brilliant astrophysicist discovers parallel reality distortions that threaten to collapse humanity's timeline.",
        "genre": "Sci-Fi",
        "genres": ["Sci-Fi", "Drama"],
        "year": 2026,
        "rating": 9.3,
        "duration_mins": 156,
        "poster_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80",
        "is_trending": True,
        "is_popular": False,
        "tags": ["Mind-Bending", "Space", "Sci-Fi"]
    },
    {
        "title": "Crimson Horizon",
        "description": "A gripping deep-sea naval tension thriller set in international waters during a rogue submarine standoff.",
        "genre": "Thriller",
        "genres": ["Thriller", "Action"],
        "year": 2024,
        "rating": 8.5,
        "duration_mins": 115,
        "poster_url": "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=600&auto=format&fit=crop&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80",
        "is_trending": False,
        "is_popular": True,
        "tags": ["Submarine", "Suspense", "Tension"]
    },
    {
        "title": "Pixel Reboot: Overdrive",
        "description": "An animated arcade comedy where nostalgic video game villains enter a high-stakes esports tournament.",
        "genre": "Animation",
        "genres": ["Animation", "Comedy"],
        "year": 2025,
        "rating": 8.7,
        "duration_mins": 94,
        "poster_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80",
        "is_trending": True,
        "is_popular": True,
        "tags": ["Gaming", "Animation", "Family"]
    },
    {
        "title": "Midnight Laughs: Uncut",
        "description": "A hilarious stand-up compilation featuring top international comedians breaking down modern tech culture.",
        "genre": "Comedy",
        "genres": ["Comedy"],
        "year": 2026,
        "rating": 8.2,
        "duration_mins": 72,
        "poster_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop&q=80",
        "is_trending": False,
        "is_popular": True,
        "tags": ["Standup", "Short", "Comedy"]
    },
    {
        "title": "The Last Symphony of Paris",
        "description": "An emotional historical drama following a virtuoso violinist fighting to preserve artistic heritage in wartime France.",
        "genre": "Drama",
        "genres": ["Drama", "Romance"],
        "year": 2024,
        "rating": 9.0,
        "duration_mins": 138,
        "poster_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&auto=format&fit=crop&q=80",
        "is_trending": False,
        "is_popular": False,
        "tags": ["Historical", "Music", "Drama"]
    },
    {
        "title": "Echoes of Starlight",
        "description": "Two long-distance astronomers connect over deep space audio signals, forming a romance across light-years.",
        "genre": "Romance",
        "genres": ["Romance", "Sci-Fi"],
        "year": 2025,
        "rating": 8.6,
        "duration_mins": 108,
        "poster_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80",
        "is_trending": True,
        "is_popular": False,
        "tags": ["Romance", "SciFi", "Emotional"]
    },
    {
        "title": "Abyssal Whispers",
        "description": "A research crew on an arctic station unearths an ancient subterranean organism that manipulates human perception.",
        "genre": "Horror",
        "genres": ["Horror", "Thriller"],
        "year": 2025,
        "rating": 8.4,
        "duration_mins": 102,
        "poster_url": "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
        "is_trending": False,
        "is_popular": True,
        "tags": ["Horror", "Psychological", "Creepy"]
    },
    {
        "title": "Chrono Drift 3",
        "description": "Time-traveling street racers compete in illegal grand prix across historical eras, from feudal Tokyo to 2200 Chicago.",
        "genre": "Action",
        "genres": ["Action", "Sci-Fi"],
        "year": 2026,
        "rating": 8.9,
        "duration_mins": 135,
        "poster_url": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&auto=format&fit=crop&q=80",
        "is_trending": True,
        "is_popular": True,
        "tags": ["Racing", "TimeTravel", "Action"]
    }
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Seed users if empty
        if db.query(User).count() == 0:
            print("[SEED] Seeding application users...")
            admin_user = User(
                email="admin@streamly.demo",
                hashed_password=hash_password("StreamlyAdmin2026!"),
                name="System Administrator",
                role="ADMIN",
                is_active=True
            )
            analyst_user = User(
                email="analyst@streamly.demo",
                hashed_password=hash_password("StreamlyAnalyst2026!"),
                name="Data Analyst Lead",
                role="ANALYST",
                is_active=True
            )
            viewer_user = User(
                email="viewer@streamly.demo",
                hashed_password=hash_password("StreamlyViewer2026!"),
                name="Demo Viewer",
                role="VIEWER",
                is_active=True
            )
            db.add_all([admin_user, analyst_user, viewer_user])
            db.commit()

            # Seed Viewer Profile & Preferences for demo viewer
            v_profile = ViewerProfile(
                user_id=viewer_user.id,
                total_watch_time_mins=3150.0,
                avg_session_duration_mins=105.0,
                number_of_sessions=30,
                viewing_frequency_per_week=9.5,
                completion_rate=0.88,
                weekend_viewing_ratio=0.45,
                top_genre="Action",
                segment_id=0,
                segment_name="High-Engagement Action Viewers"
            )
            v_pref = ViewerPreference(
                user_id=viewer_user.id,
                exploration_level=0.5,
                preferred_genres_json=json.dumps(["Action", "Thriller", "Sci-Fi"])
            )
            db.add_all([v_profile, v_pref])
            db.commit()

        # Seed Movies if empty
        if db.query(Movie).count() == 0:
            print("[SEED] Seeding movie catalog...")
            for item in SEED_MOVIES:
                movie = Movie(
                    title=item["title"],
                    description=item["description"],
                    genre=item["genre"],
                    genres_json=json.dumps(item["genres"]),
                    year=item["year"],
                    rating=item["rating"],
                    duration_mins=item["duration_mins"],
                    poster_url=item["poster_url"],
                    backdrop_url=item["backdrop_url"],
                    is_trending=item["is_trending"],
                    is_popular=item["is_popular"],
                    tags_json=json.dumps(item["tags"])
                )
                db.add(movie)
            db.commit()

        # Seed default Settings
        if db.query(Setting).count() == 0:
            print("[SEED] Seeding system settings...")
            settings = [
                Setting(key="platform_name", value_json=json.dumps("Streamly OTT")),
                Setting(key="recommendation_algorithm", value_json=json.dumps("KMeans Segment Deterministic Rules")),
                Setting(key="default_exploration_level", value_json=json.dumps(0.5)),
                Setting(key="system_status", value_json=json.dumps("ONLINE"))
            ]
            db.add_all(settings)
            db.commit()

        print("[SEED] Database seeding complete!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
