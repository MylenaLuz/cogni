"""Senhas (Argon2id), tokens JWT de acesso e tokens opacos (renovação e redefinição)."""

from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

from .config import get_settings

_hasher = PasswordHasher()  # Argon2id com os parâmetros recomendados pela RFC 9106

# Lista curta das senhas mais comuns; a política segue o NIST SP 800-63B-4:
# tamanho mínimo, sem regras de composição e bloqueio de senhas conhecidas.
SENHAS_COMUNS = {
    "12345678",
    "123456789",
    "1234567890",
    "password",
    "password1",
    "senha123",
    "senha1234",
    "qwerty123",
    "11111111",
    "00000000",
    "87654321",
    "abc12345",
    "iloveyou",
    "admin123",
    "brasil123",
    "cogni123",
    "mudar123",
    "teste123",
    "12341234",
    "qwertyui",
    "aaaaaaaa",
}


def politica_senha(senha: str) -> str | None:
    """Retorna a mensagem de erro, ou None se a senha for aceita."""
    if len(senha) < 8:
        return "A senha precisa ter pelo menos 8 caracteres."
    if len(senha) > 128:
        return "A senha pode ter no máximo 128 caracteres."
    if senha.lower() in SENHAS_COMUNS:
        return "Essa senha é muito comum. Escolha outra."
    return None


def gerar_hash(senha: str) -> str:
    return _hasher.hash(senha)


def verificar_senha(senha: str, hash_: str) -> bool:
    try:
        return _hasher.verify(hash_, senha)
    except (VerificationError, InvalidHashError):
        return False


def criar_access_token(usuario_id: uuid.UUID) -> str:
    s = get_settings()
    agora = datetime.now(UTC)
    payload = {"sub": str(usuario_id), "iat": agora, "exp": agora + timedelta(minutes=s.access_token_minutos)}
    return jwt.encode(payload, s.jwt_secret, algorithm="HS256")


def ler_access_token(token: str) -> uuid.UUID | None:
    try:
        payload = jwt.decode(token, get_settings().jwt_secret, algorithms=["HS256"])
        return uuid.UUID(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None


def token_opaco() -> tuple[str, str]:
    """Gera um token aleatório e o seu hash. Só o hash vai para o banco."""
    token = secrets.token_urlsafe(32)
    return token, hash_token(token)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
