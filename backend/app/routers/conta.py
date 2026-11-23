"""Direitos do titular (LGPD, art. 18): exportar e excluir os próprios dados."""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..config import get_settings
from ..db import get_db
from ..deps import cuidador_atual, pacientes_do_cuidador
from ..models import Cuidador, CuidadorPaciente, LogAcesso

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
    """Exclui a conta. Pessoas sem nenhum outro cuidador vinculado são excluídas junto."""
    for p in pacientes_do_cuidador(db, c):
        outros = [v for v in p.vinculos if v.cuidador_id != c.id and v.ativo]
        if not outros:
            db.delete(p)
    for v in db.query(CuidadorPaciente).filter(CuidadorPaciente.cuidador_id == c.id):
        db.delete(v)
    db.delete(c.usuario)
    db.commit()
    response.delete_cookie("cogni_refresh", path=get_settings().cookie_path)
