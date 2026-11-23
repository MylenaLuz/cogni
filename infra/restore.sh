#!/usr/bin/env sh
# Restaura um backup em uma máquina nova:
#   docker compose -f docker-compose.prod.yml up -d db
#   infra/restore.sh backups/cogni-AAAAMMDD-HHMM.sql.gz
#   docker compose -f docker-compose.prod.yml up -d
set -eu
[ $# -eq 1 ] || { echo "uso: $0 arquivo.sql.gz"; exit 1; }
gunzip -c "$1" | docker compose -f "$(dirname "$0")/../docker-compose.prod.yml" exec -T db psql -U cogni cogni
echo "Restauração concluída."
