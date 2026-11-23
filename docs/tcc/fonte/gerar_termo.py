"""Gera o apêndice do TCC com o termo de uso a partir de src/legal/termo.json,
a mesma fonte usada pela tela /termos do sistema. Uso: python3 gerar_termo.py"""
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
termo = json.loads((BASE.parents[2] / "src" / "legal" / "termo.json").read_text(encoding="utf-8"))

linhas = [
    "# APÊNDICE D – TERMO DE USO E POLÍTICA DE PRIVACIDADE DO COGNI {.unnumbered .apendice}",
    "",
    f"Texto integral exibido no sistema (tela \"Termo de uso e privacidade\"), versão {termo['versao']}, "
    f"vigente desde {termo['vigencia']}. O texto é mantido em um único arquivo do código-fonte "
    "(`src/legal/termo.json`), do qual são gerados tanto a tela do sistema quanto este apêndice.",
    "",
    "**Em resumo**",
    "",
]
linhas += [f"- {r}" for r in termo["resumo"]]
for s in termo["secoes"]:
    linhas += ["", f"**{s['titulo']}**", ""]
    for p in s["paragrafos"]:
        linhas += [p, ""]
(BASE / "md" / "96_apendice_termo.md").write_text("\n".join(linhas).rstrip() + "\n", encoding="utf-8")
print("ok")
