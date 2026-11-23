"""Aplicação FastAPI do Cogni."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from . import db
from .config import get_settings
from .routers import auth, conta, pacientes


def criar_app() -> FastAPI:
    app = FastAPI(
        title="Cogni API",
        version="0.1.0",
        description="Apoio ao cuidador: cadastros, sessões de jogos cognitivos e motor de métricas.",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_settings().origens,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth.router)
    app.include_router(pacientes.router)
    app.include_router(conta.router)

    @app.get("/health", tags=["saúde"])
    def health() -> dict:
        with db.engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "banco": "ok"}

    return app


app = criar_app()
