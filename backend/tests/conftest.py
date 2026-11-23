import os
from contextlib import contextmanager

import pytest
from fastapi.testclient import TestClient

from app import db
from app.db import Base


@pytest.fixture()
def client(tmp_path):
    # PostgreSQL quando TEST_DATABASE_URL estiver definido (CI); SQLite temporário nos demais casos
    url = os.environ.get("TEST_DATABASE_URL") or f"sqlite:///{tmp_path / 'teste.db'}"
    db.configurar(url)
    Base.metadata.drop_all(db.engine())
    Base.metadata.create_all(db.engine())
    from app.main import criar_app
    from app.routers import auth

    auth._falhas.clear()
    with TestClient(criar_app()) as c:
        yield c
    db.engine().dispose()
    Base.metadata.drop_all(db.engine())


def cadastrar(client, email="ana@exemplo.com", senha="cuidado-diario", idoso=True):
    corpo = {
        "nome_completo": "Ana Souza",
        "email": email,
        "senha": senha,
        "telefone": "41999990000",
        "tipo_vinculo": "Filho(a)",
        "aceite_termo": True,
    }
    if idoso:
        corpo["idoso"] = {"nome_completo": "Helena Souza", "data_nascimento": "1948-03-10", "condicao": "Alzheimer"}
    r = client.post("/auth/cadastro", json=corpo)
    assert r.status_code == 201, r.text
    return r.json()["access_token"]


def auth(token):
    return {"Authorization": f"Bearer {token}"}


@contextmanager
def abrir_sessao():
    gen = db.get_db()
    sessao = next(gen)
    try:
        yield sessao
    finally:
        sessao.close()
