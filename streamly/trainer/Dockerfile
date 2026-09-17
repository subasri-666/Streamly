FROM python:3.11-slim

WORKDIR /app

COPY trainer/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY trainer/ ./trainer/
COPY data/ ./data/

ENV DATA_PATH=/app/data/ott_viewer_activity.csv
ENV MODELS_DIR=/models

CMD ["python", "trainer/train.py"]
