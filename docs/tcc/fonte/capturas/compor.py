from PIL import Image, ImageDraw, ImageFont, ImageOps
import sys
from pathlib import Path
T = Path(__file__).parent / 'telas'
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
FONTE = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 34)
H = 1688
def seg(nome, ini=0, fim=None):
    im = Image.open(T / f'{nome}.png').convert('RGB')
    fim = min(fim or ini + H, im.height)
    return im.crop((0, ini, im.width, fim))
FIGS = {
 'telas_acesso': [(seg('01_login'), 'Entrar'), (seg('02_cadastro1'), 'Cadastro: etapa 1'), (seg('03_cadastro2'), 'Cadastro: etapa 2'), (seg('04_cadastro3'), 'Cadastro: etapa 3')],
 'telas_painel': [(seg('10_painel', 0), 'Painel (início)'), (seg('10_painel', 2786 - H), 'Painel (fim)'), (seg('11_pessoas'), 'Pessoas'), (seg('12_nova'), 'Nova pessoa')],
 'telas_perfil': [(seg('13_perfil', 0), 'Estado, radar e evolução'), (seg('13_perfil', H), 'Domínios e sessões'), (seg('13_perfil', 2 * H), 'Histórico')],
 'telas_relatorios': [(seg('15_relatorios', 0), 'Filtros, índice e gráficos'), (seg('15_relatorios', H), 'Domínios e sessões')],
 'telas_analises': [(seg('16_analises', 0), 'Explicação e perguntas'), (seg('16_analises', H), 'Avisos'), (seg('16_analises', 2 * H), 'Sugestões')],
 'telas_termo': [(seg('30_termo'), 'Termo de uso'), (seg('31_conta', 0), 'Minha conta'), (seg('32_novo_aceite'), 'Novo aceite')],
 'telas_papeis': [(seg('50_papeis_lista'), 'Pessoas e papel'), (seg('51_acompanhante'), 'Perfil como acompanhante'), (seg('53_quem_acompanha'), 'Quem acompanha')],
 'telas_instituicao': [(seg('54_instituicao', 0, 1060), 'Equipe e convite'), (seg('54_instituicao', 1000, 2104), 'Pessoas e atribuição'), (seg('52_conta_convite'), 'Minha conta: convite')],
 'telas_jogos1': [(seg('20_jogos'), 'Catálogo'), (seg('21_atencao_inicio'), 'Atenção: níveis'), (seg('22_atencao_jogo'), 'Atenção: partida')],
 'telas_jogos2': [(seg('23_pares_inicio'), 'Pares: níveis'), (seg('24_pares_jogo'), 'Pares: partida'), (seg('25_categorias_inicio'), 'Categorias: níveis'), (seg('26_categorias_jogo'), 'Categorias: partida')],
 'telas_jogos3': [(seg('27_imagens_inicio'), 'Imagens: níveis'), (seg('28_imagens_jogo'), 'Imagens: partida'), (seg('29_resultado'), 'Resultado da sessão')],
}
for nome, itens in FIGS.items():
    gap, legenda = 40, 70
    alt = max(im.height for im, _ in itens)
    larg = sum(im.width for im, _ in itens) + gap * (len(itens) - 1)
    tela = Image.new('RGB', (larg, alt + legenda), 'white')
    d = ImageDraw.Draw(tela); x = 0
    for i, (im, rot) in enumerate(itens):
        im = ImageOps.expand(im, border=2, fill='#C9C4BA')
        tela.paste(im, (x, 0))
        txt = f'({chr(97 + i)}) {rot}'
        w = d.textlength(txt, font=FONTE)
        d.text((x + (im.width - w) / 2, alt + 18), txt, fill='#222222', font=FONTE)
        x += im.width - 4 + gap
    tela.save(OUT / f'{nome}.png', optimize=True)
    print(nome, tela.size)
