"""Configuração lida de variáveis de ambiente (arquivo .env em desenvolvimento)."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+psycopg://cogni:cogni@localhost:5432/cogni"
    jwt_secret: str = "troque-este-segredo-em-producao-0000000000"
    access_token_minutos: int = 15
    refresh_token_dias: int = 7
    reset_token_minutos: int = 30

    # Origem do front-end, usada no CORS e nos links de e-mail
    frontend_url: str = "http://localhost:8443"
    cors_origens: str = "http://localhost:8443,http://localhost:5173"
    cookie_seguro: bool = False
    # caminho do cookie de renovação: "/auth" direto na API, "/api/auth" atrás do Caddy
    cookie_path: str = "/auth"

    # E-mail (SMTP padrão). Sem host configurado, o link de recuperação vai para o log.
    smtp_host: str = ""
    smtp_porta: int = 587
    smtp_usuario: str = ""
    smtp_senha: str = ""
    smtp_remetente: str = "Cogni <nao-responda@cogni.local>"

    # Limite de tentativas de login por e-mail
    login_max_falhas: int = 5
    login_janela_minutos: int = 15

    @property
    def origens(self) -> list[str]:
        return [o.strip() for o in self.cors_origens.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
