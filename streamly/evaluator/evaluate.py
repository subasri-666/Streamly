import os
import sys
import time
import json
import requests
from datetime import datetime, timezone

API_BASE_URL = os.environ.get("API_URL", "http://localhost:8000").rstrip("/")
OUTPUT_METRICS_PATH = os.environ.get("METRICS_PATH", "metrics.json")
MAX_RETRIES = 30
RETRY_DELAY = 2

def wait_for_api_health():
    print(f"[EVALUATOR] Waiting for API health at {API_BASE_URL}/health ...")
    health_url = f"{API_BASE_URL}/health"
    
    for i in range(MAX_RETRIES):
        try:
            resp = requests.get(health_url, timeout=5)
            if resp.status_code == 200 and resp.json().get("status") in ["healthy", "degraded"]:
                print(f"[EVALUATOR] API is healthy! (Attempt {i+1})")
                return True, resp.json()
        except Exception as e:
            pass
        time.sleep(RETRY_DELAY)
    
    print(f"[EVALUATOR] Error: API healthcheck timed out after {MAX_RETRIES * RETRY_DELAY}s")
    return False, None

def run_evaluation():
    print("[EVALUATOR] Starting comprehensive evaluation suite...")
    start_time = time.time()
    
    healthy, health_resp = wait_for_api_health()
    if not healthy:
        sys.exit(1)

    test_results = []

    # Test 1: GET /health
    test_results.append({
        "test_name": "api_healthcheck",
        "passed": True,
        "status_code": 200,
        "details": health_resp
    })

    # Test 2: Valid Recommendation Request
    valid_payload = {
        "user_id": "eval-user-01",
        "total_watch_time_mins": 3200.0,
        "avg_session_duration_mins": 110.0,
        "number_of_sessions": 30,
        "viewing_frequency_per_week": 9.5,
        "completion_rate": 0.85,
        "weekend_viewing_ratio": 0.45,
        "top_genres": ["Action", "Thriller"],
        "exploration_level": 0.5
    }
    t2_start = time.time()
    resp2 = requests.post(f"{API_BASE_URL}/recommend", json=valid_payload)
    t2_latency = round((time.time() - t2_start) * 1000, 2)
    t2_passed = (resp2.status_code == 200 and resp2.json().get("status") == "success")
    test_results.append({
        "test_name": "valid_recommendation_request",
        "passed": t2_passed,
        "status_code": resp2.status_code,
        "latency_ms": t2_latency,
        "segment_returned": resp2.json().get("segment", {}).get("segment_name") if t2_passed else None
    })

    # Test 3: Missing fields (Empty JSON payload)
    resp3 = requests.post(f"{API_BASE_URL}/recommend", json={})
    test_results.append({
        "test_name": "missing_fields_graceful_handling",
        "passed": resp3.status_code == 200,
        "status_code": resp3.status_code
    })

    # Test 4: Wrong numeric type (string instead of float)
    resp4 = requests.post(f"{API_BASE_URL}/recommend", json={"total_watch_time_mins": "invalid_string_val"})
    test_results.append({
        "test_name": "string_for_numeric_validation",
        "passed": resp4.status_code in [200, 422],
        "status_code": resp4.status_code
    })

    # Test 5: Negative numeric values
    resp5 = requests.post(f"{API_BASE_URL}/recommend", json={"total_watch_time_mins": -500.0, "avg_session_duration_mins": -30.0})
    test_results.append({
        "test_name": "negative_value_sanitization",
        "passed": resp5.status_code == 200 and resp5.json().get("status") == "success",
        "status_code": resp5.status_code
    })

    # Test 6: Empty genre list
    resp6 = requests.post(f"{API_BASE_URL}/recommend", json={"top_genres": []})
    test_results.append({
        "test_name": "empty_genre_list_fallback",
        "passed": resp6.status_code == 200 and len(resp6.json().get("recommendations", [])) > 0,
        "status_code": resp6.status_code
    })

    # Test 7: Unknown genre string
    resp7 = requests.post(f"{API_BASE_URL}/recommend", json={"top_genres": ["NonExistentGenre123"]})
    test_results.append({
        "test_name": "unknown_genre_resilience",
        "passed": resp7.status_code == 200,
        "status_code": resp7.status_code
    })

    # Test 8: Extreme watch time value
    resp8 = requests.post(f"{API_BASE_URL}/recommend", json={"total_watch_time_mins": 99999999.0})
    test_results.append({
        "test_name": "extreme_numeric_clipping",
        "passed": resp8.status_code == 200,
        "status_code": resp8.status_code
    })

    # Test 9: Reproducibility & Determinism (Repeated API requests)
    resp9a = requests.post(f"{API_BASE_URL}/recommend", json=valid_payload).json()
    resp9b = requests.post(f"{API_BASE_URL}/recommend", json=valid_payload).json()
    seg_a = resp9a.get("segment", {}).get("segment_id")
    seg_b = resp9b.get("segment", {}).get("segment_id")
    reproducible = (seg_a is not None and seg_a == seg_b)
    test_results.append({
        "test_name": "reproducibility_and_determinism",
        "passed": reproducible,
        "details": f"Segment A: {seg_a}, Segment B: {seg_b}"
    })

    # Model Quality Metrics from model artifacts
    mod_meta_path = "models/model_metadata.json"
    seg_meta_path = "models/segment_metadata.json"
    
    sil_score = None
    inertia = None
    n_clusters = 4
    cluster_balance_ratio = None
    cluster_sizes = {}

    if os.path.exists(mod_meta_path):
        with open(mod_meta_path, "r") as f:
            mm = json.load(f)
            sil_score = mm.get("silhouette_score")
            inertia = mm.get("inertia")
            n_clusters = mm.get("n_clusters", 4)

    if os.path.exists(seg_meta_path):
        with open(seg_meta_path, "r") as f:
            sm = json.load(f)
            sizes = [v["size"] for v in sm.values()]
            if sizes:
                min_size = min(sizes)
                max_size = max(sizes)
                cluster_balance_ratio = round(min_size / max_size, 3)
                cluster_sizes = {v["name"]: v["size"] for v in sm.values()}

    total_tests = len(test_results)
    passed_tests = sum(1 for t in test_results if t["passed"])
    pass_rate = round((passed_tests / total_tests) * 100, 1)

    metrics_payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "evaluator_status": "COMPLETED",
        "overall_result": "PASS" if pass_rate >= 80.0 else "FAIL",
        "test_summary": {
            "total_tests": total_tests,
            "passed": passed_tests,
            "failed": total_tests - passed_tests,
            "pass_rate_percentage": pass_rate
        },
        "clustering_quality": {
            "algorithm": "KMeans",
            "scaler": "StandardScaler",
            "n_clusters": n_clusters,
            "silhouette_score": sil_score,
            "inertia": inertia,
            "cluster_balance_ratio": cluster_balance_ratio,
            "cluster_distribution": cluster_sizes
        },
        "api_performance": {
            "health_status": "HEALTHY",
            "average_latency_ms": t2_latency,
            "reproducible": reproducible
        },
        "test_suite_details": test_results
    }

    # Write metrics.json
    with open(OUTPUT_METRICS_PATH, "w") as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"[EVALUATOR] Evaluation finished! Pass rate: {pass_rate}%. Saved metrics to: {OUTPUT_METRICS_PATH}")

if __name__ == "__main__":
    run_evaluation()
