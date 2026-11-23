"""Direitos do titular (LGPD, art. 18): exportar e excluir os próprios dados."""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..config import get_settings
from ..db import get_db
from ..deps import cuidador_atual, pacientes_do_cuidador, papel_sobre
from ..models import Consentimento, Cuidador, LogAcesso
from ..schemas import AceiteEntrada

router = APIRouter(prefix="/conta", tags=["conta"])


@router.get("/exportar")
def exportar(db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)) -> dict:
    pacientes = pacientes_do_cuidador(db, c)
    for p in pacientes:
        db.add(LogAcesso(usuario_id=c.id, paciente_id=p.id, acao="exportacao"))
    db.commit()
    return {
        "cuidador": {
            "nome_completo": c.nome_completo,
            "email": c.usuario.email,
            "telefone": c.telefone,
            "tipo_vinculo": c.tipo_vinculo,
            "nome_instituicao": c.nome_instituicao,
            "criado_em": c.criado_em.isoformat(),
        },
        "pacientes": [
            {
                "nome_completo": p.nome_completo,
                "seu_papel": papel_sobre(db, c, p),
                "instituicao": p.instituicao.nome if p.instituicao else None,
                "data_nascimento": p.data_nascimento.isoformat() if p.data_nascimento else None,
                "condicao": p.condicao,
                "observacoes": p.observacoes,
                "sessoes": [
                    {
                        "jogo": s.jogo,
                        "nivel": s.nivel,
                        "iniciada_em": s.iniciada_em.isoformat(),
                        "pontuacao": s.pontuacao,
                        "metricas": s.metricas,
                        "observacoes": s.observacoes,
                        "eventos": [
                            {
                                "t": e.t_ms,
                                "tipo": e.tipo,
                                "alvo": e.alvo,
                                "correto": e.correto,
                                "reacao_ms": e.reacao_ms,
                            }
                            for e in s.eventos
                        ],
                    }
                    for s in p.sessoes
                ],
            }
            for p in pacientes
        ],
    }


@router.delete("", status_code=204)
def excluir(response: Response, db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)) -> None:
    """Exclui a conta.

    - Pessoas que só esta conta acompanhava são excluídas junto, com todas as sessões.
    - Se esta conta era a única responsável por uma pessoa que outros acompanham, o cuidador
      mais antigo (ou, na falta dele, o acompanhante mais antigo) passa a ser o responsável.
    - Se era o único gestor de uma instituição, o profissional mais antigo vira gestor; sem
      equipe, a instituição é excluída e as pessoas dela continuam com seus cuidadores.
    """
    for v in list(c.vinculos):
        p = v.paciente
        outros = sorted((x for x in p.vinculos if x.cuidador_id != c.id and x.ativo), key=lambda x: x.criado_em)
        if not outros:
            db.delete(p)
            continue
        if v.papel == "responsavel" and not any(x.papel == "responsavel" for x in outros):
            herdeiro = next((x for x in outros if x.papel == "cuidador"), outros[0])
            herdeiro.papel = "responsavel"
        db.delete(v)

    m = c.membro
    if m is not None:
        inst = m.instituicao
        equipe = sorted((x for x in inst.membros if x.cuidador_id != c.id), key=lambda x: x.criado_em)
        if not equipe:
            db.delete(inst)  # remove também a participação, em cascata
        else:
            if m.papel == "gestor" and not any(x.papel == "gestor" for x in equipe):
                equipe[0].papel = "gestor"
            db.delete(m)

    db.delete(c.usuario)
    db.commit()
    response.delete_cookie("cogni_refresh", path=get_settings().cookie_path)


@router.post("/aceite", status_code=204)
def aceitar_termo(dados: AceiteEntrada, db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)) -> None:
    """Registra o aceite de uma nova versão do termo de uso e privacidade."""
    db.add(Consentimento(usuario_id=c.id, finalidade="uso_do_servico", versao_termo=dados.versao_termo))
    db.commit()
