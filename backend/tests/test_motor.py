import random
from datetime import UTC, datetime, timedelta

from app.services import motor, pontuacao
from app.services.pontuacao import Evento


def _pontos(valores, jogo="atencao"):
    inicio = datetime(2026, 1, 1, tzinfo=UTC)
    return [
        motor.Ponto(inicio + timedelta(days=i), jogo, 80.0, {"tr_mediana_ms": v})
        for i, v in enumerate(valores)
    ]


def test_aprendendo_com_poucas_sessoes():
    a = motor.analisar_jogo("atencao", _pontos([800] * 10))
    assert a.estado == "aprendendo"
    assert a.faltam == motor.MIN_SESSOES - 10


def test_um_dia_ruim_nao_dispara_alerta():
    rng = random.Random(1)
    valores = [800 + rng.gauss(0, 40) for _ in range(40)]
    valores[30] = 2500  # um outlier isolado
    assert motor.analisar_jogo("atencao", _pontos(valores)).estado == "estavel"


def test_declinio_sustentado_dispara():
    rng = random.Random(2)
    valores = [800 + rng.gauss(0, 40) for _ in range(25)] + [800 + 8 * i + rng.gauss(0, 40) for i in range(1, 25)]
    assert motor.analisar_jogo("atencao", _pontos(valores)).estado == "piora"


def test_melhora_sustentada():
    rng = random.Random(3)
    valores = [900 + rng.gauss(0, 30) for _ in range(25)] + [700 + rng.gauss(0, 30) for _ in range(15)]
    assert motor.analisar_jogo("atencao", _pontos(valores)).estado == "melhora"


def test_pontuacao_atencao():
    ev = [
        Evento(t=0, tipo="estimulo", alvo="1"),
        Evento(t=500, tipo="toque", alvo="1", correto=True, reacao_ms=500),
        Evento(t=900, tipo="toque", alvo="2", correto=False),
        Evento(t=1500, tipo="omissao", alvo="3"),
        Evento(t=1600, tipo="toque", alvo="4", correto=True, reacao_ms=100, dados={"pratica": True}),
    ]
    nota, m = pontuacao.calcular("atencao", ev)
    assert m["acertos"] == 1 and m["erros"] == 1 and m["omissoes"] == 1  # prática excluída
    assert m["tr_mediana_ms"] == 500
    assert 0 <= nota <= 100


def test_pontuacao_pares_conta_perseveracao():
    ev = [
        Evento(t=100, tipo="tentativa", correto=False, dados={"cartas": [1, 2]}),
        Evento(t=200, tipo="tentativa", correto=False, dados={"cartas": [2, 1]}),
        Evento(t=300, tipo="tentativa", correto=True, dados={"cartas": [1, 5]}),
    ]
    nota, m = pontuacao.calcular("pares", ev)
    assert m["perseveracoes"] == 1
    assert m["pares"] == 1 and m["tentativas"] == 3
    assert nota == round(100 / 3, 1)


def test_pontuacao_categorias_penaliza_intrusoes():
    ev = [Evento(t=i * 100, tipo="toque", correto=i < 4) for i in range(6)]
    nota, m = pontuacao.calcular("categorias", ev, {"total_corretas": 5})
    assert m["acertos"] == 4 and m["intrusoes"] == 2
    assert nota == 60.0


def test_textos_nao_diagnosticos():
    rng = random.Random(4)
    valores = [800 + rng.gauss(0, 40) for _ in range(25)] + [1400 + rng.gauss(0, 40) for _ in range(10)]
    analise = motor.analisar_paciente(_pontos(valores))
    textos = " ".join(t["mensagem"] for t in motor.textos_insight("Helena Souza", analise)).lower()
    assert "helena" in textos
    for proibida in ("diagnóstic", "detectado", "medicament", "alzheimer", "demência"):
        assert proibida not in textos
