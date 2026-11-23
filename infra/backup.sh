#!/usr/bin/env sh
# Backup diário do PostgreSQL com rotação (7 diários). Agende no cron do servidor:
#   15 3 * * * /caminho/cogni/infra/backup.sh
# Copie a pasta de backups para fora do servidor (rclone, scp, etc.).
set -eu
DESTINO="${DESTINO:-$(dirname "$0")/../backups}"
mkdir -p "$DESTINO"
ARQUIVO="$DESTINO/cogni-$(date +%Y%m%d-%H%M).sql.gz"
docker compose -f "$(dirname "$0")/../docker-compose.prod.yml" exec -T db pg_dump -U cogni cogni | gzip > "$ARQUIVO"
ls -1t "$DESTINO"/cogni-*.sql.gz | tail -n +8 | xargs -r rm --
echo "Backup gravado em $ARQUIVO"
