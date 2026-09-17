FROM python:3.11-slim

WORKDIR /app

COPY evaluator/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY evaluator/ ./evaluator/

ENV API_URL=http://api:8000
ENV METRICS_PATH=/app/metrics.json

CMD ["python", "evaluator/evaluate.py"]
