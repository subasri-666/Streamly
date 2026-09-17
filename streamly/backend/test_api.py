import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["model_loaded"] is True
    assert "uptime_seconds" in data

def test_recommend_valid():
    payload = {
        "user_id": "test-user-1",
        "total_watch_time_mins": 3500.0,
        "avg_session_duration_mins": 110.0,
        "number_of_sessions": 30,
        "viewing_frequency_per_week": 9.5,
        "completion_rate": 0.85,
        "weekend_viewing_ratio": 0.45,
        "top_genres": ["Action", "Thriller"],
        "exploration_level": 0.5
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "segment" in data
    assert "segment_name" in data["segment"]
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0
    assert "recommendation_reason" in data["recommendations"][0]

def test_recommend_invalid_types_and_edge_cases():
    # Negative watch time and empty genre list
    payload = {
        "user_id": "edge-case-user",
        "total_watch_time_mins": -500.0,
        "avg_session_duration_mins": -20.0,
        "top_genres": [],
        "exploration_level": 1.5 # Should be handled gracefully
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code in [200, 422]
    if response.status_code == 200:
        data = response.json()
        assert data["status"] == "success"
