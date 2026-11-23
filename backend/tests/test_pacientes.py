from datetime import UTC, datetime, timedelta

from conftest import auth, cadastrar


def _sessao_atencao(inicio: datetime, reacoes: list[float]) -> dict:
    eventos, t = [], 0.0
    for i, rt in enumerate(reacoes):
        eventos.append({"t": t, "tipo": "estimulo", "alvo": str(i % 9)})
        t += rt
        eventos.append({"t": t, "tipo": "toque", "alvo": str(i % 9), "correto": True, "reacao_ms": rt})
        t += 200
    return {
        "jogo": "atencao", "nivel": 1,
        "iniciada_em": inicio.isoformat(), "finalizada_em": (inicio + timedelta(milliseconds=t)).isoformat(),
        "eventos": eventos,
    }


def test_cadastro_traz_o_idoso_e_lista(client):
    token = cadastrar(client)
    r = client.get("/pacientes", headers=auth(token))
    assert r.status_code == 200
    [p] = r.json()
    assert p["nome_completo"] == "Helena Souza"
    assert p["estado"] in ("aprendendo", "estavel")


def test_cuidador_nao_acessa_paciente_de_outro(client):
    token_a = cadastrar(client, email="a@ex.com")
    token_b = cadastrar(client, email="b@ex.com")
    pid = client.get("/pacientes", headers=auth(token_a)).json()[0]["id"]
    assert client.get(f"/pacientes/{pid}", headers=auth(token_b)).status_code == 404
    assert client.get(f"/pacientes/{pid}/sessoes", headers=auth(token_b)).status_code == 404
    corpo = _sessao_atencao(datetime.now(UTC), [700] * 5)
    assert client.post(f"/pacientes/{pid}/sessoes", json=corpo, headers=auth(token_b)).status_code == 404


def test_registrar_sessao_calcula_metricas(client):
    token = cadastrar(client)
    pid = client.get("/pacientes", headers=auth(token)).json()[0]["id"]
    corpo = _sessao_atencao(datetime.now(UTC), [600, 700, 800, 900, 1000])
    r = client.post(f"/pacientes/{pid}/sessoes", json=corpo, headers=auth(token))
    assert r.status_code == 201, r.text
    s = r.json()
    assert s["versao_pontuacao"] == "v1"
    assert s["metricas"]["acertos"] == 5
    assert s["metricas"]["tr_mediana_ms"] == 800
    assert 0 <= s["pontuacao"] <= 100
    assert len(client.get(f"/pacientes/{pid}/sessoes", headers=auth(token)).json()) == 1


def test_criar_editar_arquivar(client):
    token = cadastrar(client, idoso=False)
    r = client.post("/pacientes", json={"nome_completo": "José Pereira"}, headers=auth(token))
    assert r.status_code == 201
    pid = r.json()["id"]
    r = client.patch(f"/pacientes/{pid}", json={"observacoes": "Prefere manhãs."}, headers=auth(token))
    assert r.json()["observacoes"] == "Prefere manhãs."
    assert client.delete(f"/pacientes/{pid}", headers=auth(token)).status_code == 204
    assert client.get("/pacientes", headers=auth(token)).json() == []


def test_painel_e_alerta_nao_diagnostico(client):
    token = cadastrar(client)
    pid = client.get("/pacientes", headers=auth(token)).json()[0]["id"]
    inicio = datetime.now(UTC) - timedelta(days=60)
    # 18 sessões estáveis (aprendizado + padrão) e 10 sessões bem mais lentas
    for i in range(28):
        base = 750 + (i % 3) * 20
        if i >= 18:
            base += 600
        corpo = _sessao_atencao(inicio + timedelta(days=2 * i), [base, base + 10, base - 10, base + 5])
        assert client.post(f"/pacientes/{pid}/sessoes", json=corpo, headers=auth(token)).status_code == 201

    painel = client.get("/painel", headers=auth(token)).json()
    assert painel["alertas"] == 1
    alerta = painel["pacientes"][0]["alerta"]
    assert "profissional de saúde" in alerta
    for proibida in ("diagnóstic", "detectado", "medicament", "doença"):
        assert proibida not in alerta.lower()

    insights = client.get("/insights", headers=auth(token)).json()
    assert insights[0]["tipo"] == "alerta"


def test_exportar_e_excluir_conta(client):
    token = cadastrar(client)
    pid = client.get("/pacientes", headers=auth(token)).json()[0]["id"]
    client.post(f"/pacientes/{pid}/sessoes", json=_sessao_atencao(datetime.now(UTC), [700] * 3),
                headers=auth(token))
    dados = client.get("/conta/exportar", headers=auth(token)).json()
    assert dados["pacientes"][0]["sessoes"][0]["eventos"]
    assert client.delete("/conta", headers=auth(token)).status_code == 204
    assert client.get("/auth/eu", headers=auth(token)).status_code == 401
