"""Monta o documento do TCC (ABNT) a partir dos capitulos em Markdown.

Etapas: (1) pre-processa macros (figuras, quadros, tabelas, referencias cruzadas);
(2) gera o reference.docx com os estilos ABNT; (3) converte com pandoc;
(4) pos-processa com python-docx (capa, folha de rosto, secoes, paginacao,
sumario e listas como campos, bordas de quadros e tabelas).
"""
from __future__ import annotations

import copy
import re
import subprocess
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

BASE = Path(__file__).resolve().parent
MD = BASE / "md"
OUT = BASE / "out"
OUT.mkdir(exist_ok=True)
FONT = "Arial"

TITULO = "COGNI: PLATAFORMA DE APOIO AO CUIDADOR PARA ESTIMULAÇÃO COGNITIVA E ACOMPANHAMENTO LONGITUDINAL DE IDOSOS COM DOENÇAS NEURODEGENERATIVAS"
AUTORES = ["KIMBERLY VALLE", "LUCAS MATHEUS VAZ", "MYLENA ALVES"]
INSTITUICAO = ["UNICESUMAR – CENTRO UNIVERSITÁRIO DE MARINGÁ", "CURSO DE ENGENHARIA DE SOFTWARE"]
CIDADE_ANO = ["CURITIBA – PR", "2026"]
NATUREZA = ("Trabalho de Conclusão de Curso apresentado ao Curso de Engenharia de Software da "
            "UniCesumar – Centro Universitário de Maringá, como requisito parcial para aprovação "
            "na disciplina de Trabalho de Conclusão de Curso I.")
ORIENTADOR = "Orientador: Prof. Dr. Silvio Bortoleto"


# ----------------------------------------------------------------------------- 1. pre-processamento
def preprocessar() -> tuple[str, list[str]]:
    arquivos = sorted(MD.glob("*.md"))
    texto = "\n\n".join(a.read_text(encoding="utf-8") for a in arquivos)

    contadores = {"fig": 0, "qua": 0, "tab": 0}
    nomes = {"fig": "Figura", "qua": "Quadro", "tab": "Tabela"}
    numeros: dict[str, str] = {}
    ordem_tabelas: list[str] = []

    padrao = re.compile(r"^@@(FIG|QUADRO|TABELA)\|([^|\n]+)\|", re.M)
    for m in padrao.finditer(texto):
        tipo = {"FIG": "fig", "QUADRO": "qua", "TABELA": "tab"}[m.group(1)]
        contadores[tipo] += 1
        numeros[f"{tipo}:{m.group(2)}"] = f"{nomes[tipo]} {contadores[tipo]}"

    def ref(m):
        chave = m.group(1)
        if chave not in numeros:
            raise SystemExit(f"Referencia cruzada inexistente: {chave}")
        return numeros[chave]

    texto = re.sub(r"\{\{((?:fig|qua|tab):[^}]+)\}\}", ref, texto)

    def div(estilo, conteudo):
        return f'\n::: {{custom-style="{estilo}"}}\n{conteudo}\n:::\n'

    linhas_saida = []
    for linha in texto.split("\n"):
        if linha.startswith("@@FIG|"):
            _, id_, titulo, caminho, fonte, largura = linha.split("|")
            n = numeros[f"fig:{id_}"]
            linhas_saida.append(div("Legenda Figura", f"{n} – {titulo}"))
            linhas_saida.append(div("Figura", f"![]({BASE / caminho}){{width={largura}cm}}"))
            linhas_saida.append(div("Fonte", f"Fonte: {fonte}"))
        elif linha.startswith("@@QUADRO|") or linha.startswith("@@TABELA|"):
            tipo_, id_, titulo = linha.split("|")
            tipo = "qua" if tipo_ == "@@QUADRO" else "tab"
            ordem_tabelas.append(tipo)
            estilo = "Legenda Quadro" if tipo == "qua" else "Legenda Tabela"
            linhas_saida.append(div(estilo, f"{numeros[f'{tipo}:{id_}']} – {titulo}"))
        elif linha.startswith("@@FONTE|"):
            linhas_saida.append(div("Fonte", f"Fonte: {linha.split('|', 1)[1]}"))
        elif linha.strip() == "[[SIMCODE]]":
            codigo = (BASE / "simulacao" / "simular.py").read_text(encoding="utf-8")
            linhas_saida.append("```python\n" + codigo + "\n```")
        else:
            linhas_saida.append(linha)
    return "\n".join(linhas_saida), ordem_tabelas


# ----------------------------------------------------------------------------- 2. reference.docx
def estilo_par(doc, nome, *, tamanho=12, negrito=False, italico=False, alinhamento=WD_ALIGN_PARAGRAPH.JUSTIFY,
               recuo=1.25, espaco_linha=1.5, antes=0, depois=0, caixa_alta=False, base=None, quebra=False,
               cor=None):
    estilos = doc.styles
    try:
        st = estilos[nome]
    except KeyError:
        st = estilos.add_style(nome, WD_STYLE_TYPE.PARAGRAPH)
    if base:
        st.base_style = estilos[base]
    f = st.font
    f.name = FONT
    f.size = Pt(tamanho)
    f.bold = negrito
    f.italic = italico
    f.all_caps = caixa_alta
    f.color.rgb = cor or RGBColor(0, 0, 0)
    rpr = st.element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    for att in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rfonts.set(qn(att), FONT)
    for att in ("w:asciiTheme", "w:hAnsiTheme", "w:cstheme", "w:eastAsiaTheme"):
        if rfonts.get(qn(att)) is not None:
            del rfonts.attrib[qn(att)]
    pf = st.paragraph_format
    pf.alignment = alinhamento
    pf.first_line_indent = Cm(recuo) if recuo else Cm(0)
    pf.left_indent = Cm(0)
    pf.line_spacing = espaco_linha
    pf.space_before = Pt(antes)
    pf.space_after = Pt(depois)
    pf.page_break_before = quebra
    pf.keep_with_next = nome.startswith("Heading") or nome.startswith("Legenda")
    return st


def gerar_reference(caminho_saida: Path):
    doc = Document(str(BASE / "ref_default.docx"))
    J, C, L = WD_ALIGN_PARAGRAPH.JUSTIFY, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT
    estilo_par(doc, "Normal")
    estilo_par(doc, "Body Text", base="Normal")
    estilo_par(doc, "First Paragraph", base="Body Text")
    estilo_par(doc, "Compact", tamanho=10, alinhamento=L, recuo=0, espaco_linha=1.0, antes=1, depois=1)
    estilo_par(doc, "Heading 1", negrito=True, alinhamento=L, recuo=0, depois=18, caixa_alta=True, quebra=True)
    estilo_par(doc, "Heading 2", alinhamento=L, recuo=0, antes=18, depois=12, caixa_alta=True)
    estilo_par(doc, "Heading 3", negrito=True, alinhamento=L, recuo=0, antes=18, depois=12)
    estilo_par(doc, "Heading 4", italico=True, alinhamento=L, recuo=0, antes=12, depois=6)
    estilo_par(doc, "Titulo Pretextual", negrito=True, alinhamento=C, recuo=0, depois=18, caixa_alta=True, quebra=True)
    for nome in ("Legenda Figura", "Legenda Quadro", "Legenda Tabela"):
        estilo_par(doc, nome, tamanho=10, alinhamento=C, recuo=0, espaco_linha=1.0, antes=12, depois=4)
    estilo_par(doc, "Fonte", tamanho=10, alinhamento=C, recuo=0, espaco_linha=1.0, antes=4, depois=12)
    estilo_par(doc, "Figura", alinhamento=C, recuo=0, espaco_linha=1.0)
    estilo_par(doc, "Siglas", alinhamento=L, recuo=0, espaco_linha=1.5)
    estilo_par(doc, "Referencia", alinhamento=L, recuo=0, espaco_linha=1.0, depois=12)
    estilo_par(doc, "Pendente", tamanho=11, italico=True, alinhamento=J, recuo=0, espaco_linha=1.15, antes=6, depois=6,
               cor=RGBColor(0x7A, 0x4A, 0x00))
    sc = estilo_par(doc, "Source Code", tamanho=8, alinhamento=L, recuo=0, espaco_linha=1.0)
    sc.font.name = "Courier New"
    sc.element.get_or_add_rPr().find(qn("w:rFonts")).set(qn("w:ascii"), "Courier New")
    sc.element.get_or_add_rPr().find(qn("w:rFonts")).set(qn("w:hAnsi"), "Courier New")
    for nome in ("Verbatim Char",):
        try:
            cs = doc.styles[nome]
            cs.font.name = "Courier New"
            cs.font.size = Pt(8)
        except KeyError:
            pass
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Cm(21), Cm(29.7)
    sec.top_margin, sec.left_margin = Cm(3), Cm(3)
    sec.bottom_margin, sec.right_margin = Cm(2), Cm(2)
    sec.header_distance = Cm(2)
    doc.save(str(caminho_saida))


# ----------------------------------------------------------------------------- 4. pos-processamento
def campo(paragrafo, instrucao, placeholder="Clique com o botão direito e escolha 'Atualizar campo'."):
    for r in list(paragrafo.runs):
        r._element.getparent().remove(r._element)

    def run_com(el):
        r = OxmlElement("w:r")
        r.append(el)
        paragrafo._p.append(r)
        return r

    b = OxmlElement("w:fldChar"); b.set(qn("w:fldCharType"), "begin"); b.set(qn("w:dirty"), "true")
    run_com(b)
    it = OxmlElement("w:instrText"); it.set(qn("xml:space"), "preserve"); it.text = f" {instrucao} "
    run_com(it)
    s = OxmlElement("w:fldChar"); s.set(qn("w:fldCharType"), "separate")
    run_com(s)
    t = OxmlElement("w:t"); t.text = placeholder
    run_com(t)
    e = OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"), "end")
    run_com(e)


def par_antes(ref, texto="", *, negrito=False, alinhamento=WD_ALIGN_PARAGRAPH.CENTER, tamanho=12,
              estilo="Normal", recuo=0, espaco=1.5, antes=0, depois=0):
    p = ref.insert_paragraph_before(texto, style=estilo)
    pf = p.paragraph_format
    pf.alignment = alinhamento
    pf.first_line_indent = Cm(recuo)
    pf.line_spacing = espaco
    pf.space_before = Pt(antes)
    pf.space_after = Pt(depois)
    for r in p.runs:
        r.font.bold = negrito
        r.font.size = Pt(tamanho)
        r.font.name = FONT
    return p


def quebra_secao(paragrafo, inicio_pagina: int | None = None):
    """Transforma o paragrafo no ultimo de uma secao (sectPr no pPr)."""
    doc_sect = paragrafo.part.document.sections[-1]._sectPr
    novo = copy.deepcopy(doc_sect)
    for el in novo.findall(qn("w:headerReference")) + novo.findall(qn("w:footerReference")):
        novo.remove(el)
    tipo = novo.find(qn("w:type"))
    if tipo is None:
        tipo = OxmlElement("w:type"); novo.insert(0, tipo)
    tipo.set(qn("w:val"), "nextPage")
    pg = novo.find(qn("w:pgNumType"))
    if pg is not None:
        novo.remove(pg)
    if inicio_pagina is not None:
        pg = OxmlElement("w:pgNumType"); pg.set(qn("w:start"), str(inicio_pagina)); novo.append(pg)
    paragrafo._p.get_or_add_pPr().append(novo)


def bordas_tabela(tabela, tipo: str):
    tbl = tabela._tbl
    tblPr = tbl.tblPr
    for el in tblPr.findall(qn("w:tblBorders")):
        tblPr.remove(el)
    borders = OxmlElement("w:tblBorders")

    def b(nome, val):
        e = OxmlElement(f"w:{nome}")
        e.set(qn("w:val"), val); e.set(qn("w:sz"), "6"); e.set(qn("w:space"), "0"); e.set(qn("w:color"), "000000")
        borders.append(e)

    if tipo == "qua":
        for n in ("top", "left", "bottom", "right", "insideH", "insideV"):
            b(n, "single")
    else:
        b("top", "single"); b("bottom", "single")
        for n in ("left", "right", "insideV", "insideH"):
            b(n, "nil")
    tblPr.append(borders)
    largura = tblPr.find(qn("w:tblW"))
    if largura is None:
        largura = OxmlElement("w:tblW"); tblPr.append(largura)
    largura.set(qn("w:type"), "pct"); largura.set(qn("w:w"), "5000")
    tabela.alignment = WD_TABLE_ALIGNMENT.CENTER
    # larguras de coluna proporcionais ao conteudo, somando a largura util (16 cm)
    ncol = len(tabela.columns)
    pesos = []
    for j in range(ncol):
        maior = max((len(r.cells[j].text) for r in tabela.rows), default=1)
        media = sum(len(r.cells[j].text) for r in tabela.rows) / max(1, len(tabela.rows))
        pesos.append(max(6.0, min(60.0, 0.5 * maior + 0.5 * media)) ** 0.8)
    total = 9070
    minimos = []
    for j in range(ncol):
        palavra = max((len(w) for r in tabela.rows for w in r.cells[j].text.split()), default=4)
        minimos.append(min(2600, palavra * 115 + 220))
    larg = [int(total * p / sum(pesos)) for p in pesos]
    for _ in range(10):  # garante o minimo de cada coluna redistribuindo o restante
        falta = [max(0, m - w) for m, w in zip(minimos, larg)]
        if not any(falta):
            break
        larg = [max(m, w) for m, w in zip(minimos, larg)]
        excesso = sum(larg) - total
        livres = [j for j in range(ncol) if larg[j] > minimos[j]]
        base = sum(larg[j] - minimos[j] for j in livres) or 1
        for j in livres:
            larg[j] -= int(excesso * (larg[j] - minimos[j]) / base)
    grid = tbl.tblGrid
    for gc, w in zip(grid.findall(qn("w:gridCol")), larg):
        gc.set(qn("w:w"), str(w))
    lay = OxmlElement("w:tblLayout"); lay.set(qn("w:type"), "fixed"); tblPr.append(lay)
    for linha in tabela.rows:
        for cel, w in zip(linha.cells, larg):
            tcPr = cel._tc.get_or_add_tcPr()
            for el in tcPr.findall(qn("w:tcW")):
                tcPr.remove(el)
            tw = OxmlElement("w:tcW"); tw.set(qn("w:w"), str(w)); tw.set(qn("w:type"), "dxa"); tcPr.insert(0, tw)
    for i, linha in enumerate(tabela.rows):
        for cel in linha.cells:
            tcPr = cel._tc.get_or_add_tcPr()
            for el in tcPr.findall(qn("w:tcBorders")):
                tcPr.remove(el)
            if tipo == "tab" and i == 0:
                tb = OxmlElement("w:tcBorders")
                e = OxmlElement("w:bottom"); e.set(qn("w:val"), "single"); e.set(qn("w:sz"), "6"); e.set(qn("w:color"), "000000")
                tb.append(e); tcPr.append(tb)
            for p in cel.paragraphs:
                p.style = "Compact"
                for r in p.runs:
                    r.font.size = Pt(10)
                    if i == 0:
                        r.font.bold = True
        trPr = linha._tr.get_or_add_trPr()
        cs = OxmlElement("w:cantSplit"); cs.set(qn("w:val"), "true"); trPr.append(cs)
        if i == 0:
            th = OxmlElement("w:tblHeader"); th.set(qn("w:val"), "true"); trPr.append(th)


def cabecalho_numerado(secao):
    secao.header.is_linked_to_previous = False
    hp = secao.header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    campo(hp, "PAGE", "1")
    for r in hp.runs:
        r.font.size = Pt(10); r.font.name = FONT


def cabecalho_vazio(secao):
    secao.header.is_linked_to_previous = False
    for p in secao.header.paragraphs:
        for r in list(p.runs):
            r._element.getparent().remove(r._element)


def _texto_espaco():
    t = OxmlElement("w:t"); t.set(qn("xml:space"), "preserve"); t.text = " "
    return t


def posprocessar(entrada: Path, saida: Path, ordem_tabelas: list[str]):
    doc = Document(str(entrada))
    corpo = doc.paragraphs

    # titulos pre-textuais: estilo proprio (nao entram no sumario)
    pretextuais = {"RESUMO", "ABSTRACT", "LISTA DE FIGURAS", "LISTA DE QUADROS", "LISTA DE TABELAS",
                   "LISTA DE ABREVIATURAS E SIGLAS", "SUMÁRIO"}
    for p in corpo:
        if p.style.name.startswith("Heading 1") and p.text.strip().upper() in pretextuais:
            p.style = doc.styles["Titulo Pretextual"]
        elif p.style.name.startswith("Heading 1") and not re.match(r"^\d", p.text.strip()):
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER  # REFERENCIAS e APENDICES

    # numero da secao separado por espaco (ABNT), e nao por tabulacao
    for p in doc.paragraphs:
        if p.style.name.startswith("Heading"):
            for r in p.runs:
                if "\t" in r.text:
                    r.text = r.text.replace("\t", " ")
            for t in p._p.iter(qn("w:tab")):
                t.getparent().replace(t, _texto_espaco())

    # resumo e abstract: paragrafo unico, espaco simples, cabendo em uma pagina
    dentro = False
    for p in doc.paragraphs:
        if p.style.name == "Titulo Pretextual":
            dentro = p.text.strip().upper() in ("RESUMO", "ABSTRACT")
            continue
        if dentro:
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.first_line_indent = Cm(0)
            p.paragraph_format.space_after = Pt(12)

    # campos de sumario e listas
    for p in doc.paragraphs:
        t = p.text.strip()
        if t == "[[TOC]]":
            campo(p, 'TOC \\h \\z \\t "Heading 1;1;Heading 2;2;Heading 3;3"')
        elif t == "[[LOF]]":
            campo(p, 'TOC \\h \\z \\t "Legenda Figura;1"')
        elif t == "[[LOQ]]":
            campo(p, 'TOC \\h \\z \\t "Legenda Quadro;1"')
        elif t == "[[LOT]]":
            campo(p, 'TOC \\h \\z \\t "Legenda Tabela;1"')

    # quadros e tabelas
    if len(doc.tables) != len(ordem_tabelas):
        print(f"AVISO: {len(doc.tables)} tabelas no docx e {len(ordem_tabelas)} marcadores")
    for tabela, tipo in zip(doc.tables, ordem_tabelas):
        bordas_tabela(tabela, tipo)

    # ---- elementos pre-textuais construidos aqui: capa, folha de rosto, folha de aprovacao
    primeiro = doc.paragraphs[0]  # RESUMO
    primeiro.paragraph_format.page_break_before = False

    # CAPA
    for linha in INSTITUICAO:
        par_antes(primeiro, linha, negrito=True)
    for _ in range(4):
        par_antes(primeiro)
    for a in AUTORES:
        par_antes(primeiro, a, negrito=True)
    for _ in range(5):
        par_antes(primeiro)
    par_antes(primeiro, TITULO, negrito=True, espaco=1.5)
    for _ in range(8):
        par_antes(primeiro)
    par_antes(primeiro, CIDADE_ANO[0], negrito=True)
    fim_capa = par_antes(primeiro, CIDADE_ANO[1], negrito=True)
    quebra_secao(fim_capa)

    # FOLHA DE ROSTO
    for a in AUTORES:
        par_antes(primeiro, a, negrito=True)
    for _ in range(6):
        par_antes(primeiro)
    par_antes(primeiro, TITULO, negrito=True)
    for _ in range(3):
        par_antes(primeiro)
    natureza = par_antes(primeiro, NATUREZA, alinhamento=WD_ALIGN_PARAGRAPH.JUSTIFY, espaco=1.0, tamanho=10)
    natureza.paragraph_format.left_indent = Cm(8)
    par_antes(primeiro)
    ori = par_antes(primeiro, ORIENTADOR, alinhamento=WD_ALIGN_PARAGRAPH.LEFT, espaco=1.0, tamanho=10)
    ori.paragraph_format.left_indent = Cm(8)
    for _ in range(7):
        par_antes(primeiro)
    par_antes(primeiro, CIDADE_ANO[0], negrito=True)
    p = par_antes(primeiro, CIDADE_ANO[1], negrito=True)
    p.add_run().add_break(WD_BREAK.PAGE)

    # FOLHA DE APROVACAO
    for a in AUTORES:
        par_antes(primeiro, a, negrito=True)
    par_antes(primeiro)
    par_antes(primeiro, TITULO, negrito=True)
    par_antes(primeiro)
    nat2 = par_antes(primeiro, NATUREZA, alinhamento=WD_ALIGN_PARAGRAPH.JUSTIFY, espaco=1.0, tamanho=10)
    nat2.paragraph_format.left_indent = Cm(8)
    par_antes(primeiro)
    par_antes(primeiro, "Aprovado em: ____ de ______________ de 2026.", alinhamento=WD_ALIGN_PARAGRAPH.LEFT)
    par_antes(primeiro)
    par_antes(primeiro, "BANCA EXAMINADORA", negrito=True)
    for nome in ("Prof. Dr. Silvio Bortoleto (Orientador)\nUniCesumar",
                 "Prof.(a) ______________________________\nUniCesumar",
                 "Prof.(a) ______________________________\nUniCesumar"):
        par_antes(primeiro)
        par_antes(primeiro, "_____________________________________________", espaco=1.0)
        for parte in nome.split("\n"):
            par_antes(primeiro, parte, espaco=1.0)
    p = par_antes(primeiro)
    p.add_run().add_break(WD_BREAK.PAGE)

    # ---- secao textual: comeca em "1 INTRODUCAO"
    intro = next(p for p in doc.paragraphs if p.style.name == "Heading 1" and re.match(r"^1\s", p.text.strip()))
    anterior = intro._p.getprevious()
    from docx.text.paragraph import Paragraph
    while anterior is not None and anterior.tag != qn("w:p"):
        anterior = anterior.getprevious()
    quebra_secao(Paragraph(anterior, intro._parent), inicio_pagina=None)
    intro.paragraph_format.page_break_before = False

    # agora ha 3 secoes: capa | pre-textuais | textuais
    secoes = doc.sections
    # numeracao: conta a partir da folha de rosto (secao 2 inicia em 1)
    s2 = secoes[1]._sectPr
    pg = OxmlElement("w:pgNumType"); pg.set(qn("w:start"), "1"); s2.append(pg)
    cabecalho_vazio(secoes[0])
    cabecalho_vazio(secoes[1])
    cabecalho_numerado(secoes[2])

    # pedir atualizacao de campos ao abrir
    settings = doc.settings.element
    uf = OxmlElement("w:updateFields"); uf.set(qn("w:val"), "true"); settings.append(uf)

    doc.core_properties.title = "Cogni – TCC I"
    doc.core_properties.author = "Kimberly Valle; Lucas Matheus Vaz; Mylena Alves"
    doc.core_properties.language = "pt-BR"
    doc.save(str(saida))


def main():
    texto, ordem = preprocessar()
    (OUT / "tcc_completo.md").write_text(texto, encoding="utf-8")
    ref = OUT / "reference.docx"
    gerar_reference(ref)
    bruto = OUT / "bruto.docx"
    subprocess.run(["pandoc", str(OUT / "tcc_completo.md"), "-f", "markdown+tex_math_dollars", "-o", str(bruto),
                    "--reference-doc", str(ref), "--number-sections", "-M", "lang=pt-BR"], check=True)
    final = OUT / "TCC_Cogni_ABNT.docx"
    posprocessar(bruto, final, ordem)
    print("ok", final)


if __name__ == "__main__":
    main()
