FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir \
    "fastapi>=0.115" "uvicorn[standard]>=0.30" "sqlalchemy>=2.0" "alembic>=1.13" "psycopg[binary]>=3.2" \
    "pydantic>=2.7" "pydantic-settings>=2.3" "email-validator>=2.1" "argon2-cffi>=23.1" "pyjwt>=2.8"

COPY alembic.ini ./
COPY alembic ./alembic
COPY app ./app

RUN useradd --create-home cogni
USER cogni
EXPOSE 8000

# aplica as migrações e sobe a API
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2"]
