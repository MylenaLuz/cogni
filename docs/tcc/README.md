# Documento do TCC I

- `TCC_Cogni_ABNT.docx`: documento editável (Word). Ao abrir, aceite atualizar os campos para recalcular o sumário e as listas.
- `TCC_Cogni_ABNT.pdf`: versão em PDF.
- `fonte/`: capítulos em Markdown (`md/`), figuras (`img/`), diagramas Mermaid (`diagramas/`), simulação da coorte sintética (`simulacao/`) e o script de montagem.

Para regenerar: `cd docs/tcc/fonte && python3 build.py && python3 topdf.py out/TCC_Cogni_ABNT.docx out/TCC_Cogni_ABNT.pdf` (requer pandoc, python-docx, LibreOffice e Python com NumPy e Matplotlib).

Estudos com usuários (questionário, entrevistas e teste de usabilidade) ficaram para o TCC II, após trâmite ético.
