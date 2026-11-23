"""Conexão com o banco e sessão do SQLAlchemy."""

from collections.abc import Iterator

from sqlalchemy import JSON, create_engine
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings

# JSONB no PostgreSQL, JSON simples no SQLite dos testes
JsonType = JSON().with_variant(JSONB(), "postgresql")


class Base(DeclarativeBase):
    pass


_engine = None
_SessionLocal: sessionmaker[Session] | None = None


def configurar(url: str | None = None) -> None:
    global _engine, _SessionLocal
    url = url or get_settings().database_url
    kwargs = {"connect_args": {"check_same_thread": False}} if url.startswith("sqlite") else {}
    _engine = create_engine(url, pool_pre_ping=True, **kwargs)
    _SessionLocal = sessionmaker(bind=_engine, autoflush=False, expire_on_commit=False)


def engine():
    if _engine is None:
        configurar()
    return _engine


def get_db() -> Iterator[Session]:
    if _SessionLocal is None:
        configurar()
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()
