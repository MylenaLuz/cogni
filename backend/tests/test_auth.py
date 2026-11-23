from conftest import abrir_sessao, auth, cadastrar

from app.models import TokenRedefinicao, Usuario
from app.security import hash_token


def test_cadastro_login_e_eu(client):
    token = cadastrar(client)
    r = client.get("/auth/eu", headers=auth(token))
    assert r.status_code == 200
    assert r.json()["email"] == "ana@exemplo.com"

    r = client.post("/auth/login", json={"email": "ANA@exemplo.com", "senha": "cuidado-diario"})
    assert r.status_code == 200
    assert "cogni_refresh" in r.cookies


def test_senha_nunca_em_texto_puro(client):
    cadastrar(client)
    with abrir_sessao() as sessao:
        u = sessao.query(Usuario).one()
        assert "cuidado-diario" not in u.senha_hash
        assert u.senha_hash.startswith("$argon2id$")


def test_politica_de_senha(client):
    for senha, esperado in [("curta", 422), ("12345678", 422), ("frase longa sem regras", 201)]:
        r = client.post(
            "/auth/cadastro",
            json={
                "nome_completo": "Teste",
                "email": f"t{len(senha)}@ex.com",
                "senha": senha,
                "aceite_termo": True,
            },
        )
        assert r.status_code == esperado, (senha, r.text)


def test_exige_aceite_do_termo(client):
    r = client.post(
        "/auth/cadastro",
        json={
            "nome_completo": "Teste",
            "email": "t@ex.com",
            "senha": "uma senha boa",
            "aceite_termo": False,
        },
    )
    assert r.status_code == 422


def test_email_duplicado(client):
    cadastrar(client)
    r = client.post(
        "/auth/cadastro",
        json={
            "nome_completo": "Outra",
            "email": "ana@exemplo.com",
            "senha": "uma senha boa",
            "aceite_termo": True,
        },
    )
    assert r.status_code == 409


def test_cadastro_atomico_nao_deixa_usuario_orfao(client):
    # idoso inválido (nome curto demais): nada deve ser gravado
    r = client.post(
        "/auth/cadastro",
        json={
            "nome_completo": "Ana",
            "email": "orfao@ex.com",
            "senha": "uma senha boa",
            "aceite_termo": True,
            "idoso": {"nome_completo": "X"},
        },
    )
    assert r.status_code == 422
    with abrir_sessao() as sessao:
        assert sessao.query(Usuario).filter_by(email="orfao@ex.com").count() == 0


def test_senha_errada_e_bloqueio(client):
    cadastrar(client)
    for _ in range(5):
        r = client.post("/auth/login", json={"email": "ana@exemplo.com", "senha": "errada-errada"})
        assert r.status_code == 401
        assert r.json()["detail"] == "E-mail ou senha incorretos."
    r = client.post("/auth/login", json={"email": "ana@exemplo.com", "senha": "cuidado-diario"})
    assert r.status_code == 429


def test_refresh_rotaciona_e_logout_revoga(client):
    cadastrar(client)
    r = client.post("/auth/refresh")
    assert r.status_code == 200
    antigo = r.cookies.get("cogni_refresh")
    r2 = client.post("/auth/refresh")
    assert r2.status_code == 200
    assert r2.cookies.get("cogni_refresh") != antigo

    client.post("/auth/logout")
    client.cookies.clear()
    assert client.post("/auth/refresh").status_code == 401


def test_token_invalido(client):
    assert client.get("/auth/eu").status_code == 401
    assert client.get("/auth/eu", headers=auth("abc")).status_code == 401


def test_recuperacao_de_senha(client):
    cadastrar(client)
    r = client.post("/auth/esqueci-senha", json={"email": "ninguem@ex.com"})
    assert r.status_code == 202  # mesma resposta para e-mail inexistente
    r = client.post("/auth/esqueci-senha", json={"email": "ana@exemplo.com"})
    assert r.status_code == 202

    # o token real só vai por e-mail; no teste, criamos um conhecido
    with abrir_sessao() as sessao:
        registro = sessao.query(TokenRedefinicao).one()
        registro.token_hash = hash_token("token-de-teste")
        sessao.commit()

    r = client.post("/auth/redefinir-senha", json={"token": "token-de-teste", "nova_senha": "nova senha segura"})
    assert r.status_code == 204
    r = client.post("/auth/redefinir-senha", json={"token": "token-de-teste", "nova_senha": "outra senha segura"})
    assert r.status_code == 400  # uso único
    r = client.post("/auth/login", json={"email": "ana@exemplo.com", "senha": "nova senha segura"})
    assert r.status_code == 200
