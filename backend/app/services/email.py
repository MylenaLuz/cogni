"""Envio de e-mail por SMTP padrão. Sem servidor configurado, o conteúdo vai para o log."""

import logging
import smtplib
from email.message import EmailMessage

from ..config import get_settings

log = logging.getLogger("cogni.email")


def enviar(para: str, assunto: str, corpo: str) -> None:
    s = get_settings()
    if not s.smtp_host:
        log.warning("SMTP não configurado. E-mail para %s | %s\n%s", para, assunto, corpo)
        return
    msg = EmailMessage()
    msg["From"] = s.smtp_remetente
    msg["To"] = para
    msg["Subject"] = assunto
    msg.set_content(corpo)
    with smtplib.SMTP(s.smtp_host, s.smtp_porta, timeout=10) as smtp:
        smtp.starttls()
        if s.smtp_usuario:
            smtp.login(s.smtp_usuario, s.smtp_senha)
        smtp.send_message(msg)
