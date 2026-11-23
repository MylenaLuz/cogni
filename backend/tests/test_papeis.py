"""Papéis no acompanhamento, convites por código e instituições."""

from datetime import UTC, datetime, timedelta

from tests.conftest import auth, cadastrar


def _sessao():
    inicio = datetime.now(UTC) - timedelta(minutes=2)
    return {
        "jogo": "pares",
        "nivel": 1,
        "iniciada_em": inicio.isoformat(),
        "finalizada_em": (inicio + timedelta(seconds=30)).isoformat(),
        "eventos": [{"t": 1000, "tipo": "tentativa", "correto": True, "dados": {"cartas": [0, 1]}}],
    }


def _pessoa(client, token):
    return client.get("/pacientes", headers=auth(token)).json()[0]


def _convidar(client, token, pid, papel):
    r = client.post(f"/pacientes/{pid}/convites", json={"papel": papel}, headers=auth(token))
    assert r.status_code == 201, r.text
    return r.json()["codigo"]


def test_quem_cadastra_e_responsavel(client):
    token = cadastrar(client)
    assert _pessoa(client, token)["meu_papel"] == "responsavel"


def test_convite_cuidador_e_acompanhante_com_permissoes(client):
    dono = cadastrar(client)
    pid = _pessoa(client, dono)["id"]
    cuid = cadastrar(client, email="cuidadora@ex.com", idoso=False)
    acomp = cadastrar(client, email="neto@ex.com", idoso=False)

    # código vale com ou sem hífen e em minúsculas, e só uma vez
    codigo = _convidar(client, dono, pid, "cuidador")
    r = client.post("/convites/aceitar", json={"codigo": codigo.replace("-", "").lower()}, headers=auth(cuid))
    assert r.status_code == 200 and r.json()["papel"] == "cuidador"
    assert client.post("/convites/aceitar", json={"codigo": codigo}, headers=auth(acomp)).status_code == 404
    codigo = _convidar(client, dono, pid, "acompanhante")
    assert client.post("/convites/aceitar", json={"codigo": codigo}, headers=auth(acomp)).status_code == 200

    # cuidador: vê e joga, mas não edita nem convida
    assert _pessoa(client, cuid)["meu_papel"] == "cuidador"
    assert client.post(f"/pacientes/{pid}/sessoes", json=_sessao(), headers=auth(cuid)).status_code == 201
    assert client.patch(f"/pacientes/{pid}", json={"observacoes": "x"}, headers=auth(cuid)).status_code == 403
    assert client.post(f"/pacientes/{pid}/convites", json={"papel": "cuidador"}, headers=auth(cuid)).status_code == 403

    # acompanhante: só vê
    assert client.get(f"/pacientes/{pid}/sessoes", headers=auth(acomp)).status_code == 200
    assert client.post(f"/pacientes/{pid}/sessoes", json=_sessao(), headers=auth(acomp)).status_code == 403
    assert client.delete(f"/pacientes/{pid}", headers=auth(acomp)).status_code == 403

    nomes = {v["papel"] for v in client.get(f"/pacientes/{pid}/vinculos", headers=auth(dono)).json()}
    assert nomes == {"responsavel", "cuidador", "acompanhante"}


def test_convite_vencido_nao_vale(client):
    from app.models import Convite
    from tests.conftest import abrir_sessao

    dono = cadastrar(client)
    pid = _pessoa(client, dono)["id"]
    codigo = _convidar(client, dono, pid, "cuidador")
    with abrir_sessao() as db:
        for cv in db.query(Convite):
            cv.expira_em = datetime.now(UTC) - timedelta(minutes=1)
        db.commit()
    outro = cadastrar(client, email="outro@ex.com", idoso=False)
    assert client.post("/convites/aceitar", json={"codigo": codigo}, headers=auth(outro)).status_code == 404


def test_sempre_ha_um_responsavel(client):
    dono = cadastrar(client)
    pid = _pessoa(client, dono)["id"]
    eu_id = client.get("/auth/eu", headers=auth(dono)).json()["id"]
    assert client.delete(f"/pacientes/{pid}/vinculos/{eu_id}", headers=auth(dono)).status_code == 409

    outro = cadastrar(client, email="outro@ex.com", idoso=False)
    client.post("/convites/aceitar", json={"codigo": _convidar(client, dono, pid, "cuidador")}, headers=auth(outro))
    outro_id = client.get("/auth/eu", headers=auth(outro)).json()["id"]
    r = client.patch(f"/pacientes/{pid}/vinculos/{outro_id}", json={"papel": "responsavel"}, headers=auth(dono))
    assert r.status_code == 200
    # agora o primeiro responsável pode sair
    assert client.delete(f"/pacientes/{pid}/vinculos/{eu_id}", headers=auth(dono)).status_code == 204
    assert client.get(f"/pacientes/{pid}", headers=auth(dono)).status_code == 404


def test_excluir_conta_passa_responsabilidade(client):
    dono = cadastrar(client)
    pid = _pessoa(client, dono)["id"]
    cuid = cadastrar(client, email="cuidadora@ex.com", idoso=False)
    client.post("/convites/aceitar", json={"codigo": _convidar(client, dono, pid, "cuidador")}, headers=auth(cuid))
    assert client.delete("/conta", headers=auth(dono)).status_code == 204
    assert _pessoa(client, cuid)["meu_papel"] == "responsavel"


def test_instituicao_gestor_e_profissional(client):
    r = client.post(
        "/auth/cadastro",
        json={
            "nome_completo": "Lúcia Gestora",
            "email": "gestora@ex.com",
            "senha": "uma senha boa",
            "tipo_vinculo": "Instituição",
            "nome_instituicao": "Residencial Bem Viver",
            "aceite_termo": True,
            "idoso": {"nome_completo": "Helena Costa"},
        },
    )
    gestora = r.json()["access_token"]
    eu = client.get("/auth/eu", headers=auth(gestora)).json()
    assert eu["instituicao"]["papel"] == "gestor"
    client.post("/pacientes", json={"nome_completo": "Rubens Alves"}, headers=auth(gestora))

    prof = cadastrar(client, email="prof@ex.com", idoso=False)
    codigo = client.post("/instituicao/convites", json={"papel": "profissional"}, headers=auth(gestora)).json()[
        "codigo"
    ]
    r = client.post("/convites/aceitar", json={"codigo": codigo}, headers=auth(prof))
    assert r.json()["tipo"] == "instituicao"

    # profissional da equipe não vê ninguém até ser atribuído
    assert client.get("/pacientes", headers=auth(prof)).json() == []
    inst = client.get("/instituicao", headers=auth(gestora)).json()
    assert len(inst["pessoas"]) == 2 and len(inst["membros"]) == 2
    helena = next(p for p in inst["pessoas"] if p["nome"] == "Helena Costa")["id"]
    prof_id = next(m for m in inst["membros"] if m["papel"] == "profissional")["cuidador_id"]
    r = client.post(
        f"/pacientes/{helena}/vinculos", json={"cuidador_id": prof_id, "papel": "cuidador"}, headers=auth(gestora)
    )
    assert r.status_code == 201
    assert [p["nome_completo"] for p in client.get("/pacientes", headers=auth(prof)).json()] == ["Helena Costa"]

    # profissional não convida para a instituição nem vê a lista de pessoas
    assert client.post("/instituicao/convites", json={"papel": "profissional"}, headers=auth(prof)).status_code == 403
    assert client.get("/instituicao", headers=auth(prof)).json()["pessoas"] == []

    # removido da equipe, perde o acesso
    assert client.delete(f"/instituicao/membros/{prof_id}", headers=auth(gestora)).status_code == 204
    assert client.get("/pacientes", headers=auth(prof)).json() == []
    # o único gestor não pode sair
    gestora_id = eu["id"]
    assert client.delete(f"/instituicao/membros/{gestora_id}", headers=auth(gestora)).status_code == 409


def test_outro_cuidador_nao_ve_pessoas_da_instituicao(client):
    r = client.post(
        "/auth/cadastro",
        json={
            "nome_completo": "Lúcia Gestora",
            "email": "gestora@ex.com",
            "senha": "uma senha boa",
            "tipo_vinculo": "Instituição",
            "nome_instituicao": "Residencial",
            "aceite_termo": True,
            "idoso": {"nome_completo": "Helena Costa"},
        },
    )
    pid = client.get("/pacientes", headers=auth(r.json()["access_token"])).json()[0]["id"]
    estranho = cadastrar(client, email="x@ex.com", idoso=False)
    assert client.get(f"/pacientes/{pid}", headers=auth(estranho)).status_code == 404


def test_editar_meus_dados(client):
    token = cadastrar(client)
    r = client.patch("/auth/eu", json={"nome_completo": " Ana Maria ", "telefone": "4133334444"}, headers=auth(token))
    assert r.json()["nome_completo"] == "Ana Maria" and r.json()["telefone"] == "4133334444"
