// Captura as telas do Cogni para o TCC. Requer o sistema rodando (docker compose + pnpm dev) com o seed de demonstração.
// Uso: node capturar.js && python3 compor.py ../img
const { chromium } = require('playwright');
const D = __dirname + '/telas/';
const U = 'http://localhost:8443';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
  const p = await ctx.newPage();
  const foto = async (n, full = false) => { await p.waitForTimeout(400); await p.screenshot({ path: D + n + '.png', fullPage: full }); };
  // acesso
  await p.goto(U + '/entrar'); await foto('01_login');
  await p.goto(U + '/cadastro'); await foto('02_cadastro1');
  await p.fill('input[placeholder="Seu nome"]', 'Carla Mendes');
  await p.fill('input[type=email]', 'carla.mendes@exemplo.com');
  const senhas = p.locator('input[placeholder="••••••••"]');
  await senhas.nth(0).fill('frase longa de teste'); await senhas.nth(1).fill('frase longa de teste');
  await p.check('input[type=checkbox]');
  await p.getByRole('button', { name: 'Próximo' }).click(); await foto('03_cadastro2');
  await p.fill('input[placeholder="(00) 00000-0000"]', '(41) 99999-0000'); await p.selectOption('select', 'Familiar');
  await p.getByRole('button', { name: 'Próximo' }).click(); await foto('04_cadastro3');
  await p.goto(U + '/esqueci-senha'); await foto('05_esqueci');
  // painel
  await p.goto(U + '/entrar');
  await p.fill('input[type=email]', 'demo@cogni.app'); await p.fill('input[type=password]', 'cuidar-com-dados');
  await p.click('button[type=submit]'); await p.waitForURL(U + '/');
  await p.getByRole('button', { name: /Maria Silva/ }).first().waitFor();
  await foto('10_painel', true);
  await p.goto(U + '/pessoas'); await p.getByText('Maria Silva').first().waitFor(); await foto('11_pessoas');
  await p.goto(U + '/pessoas/nova'); await foto('12_nova');
  await p.goto(U + '/pessoas'); await p.getByRole('button', { name: /Antônio Lima/ }).first().click();
  await p.getByText('Perfil por domínio').waitFor(); await p.getByText(/no total/).waitFor(); await foto('13_perfil', true);
  await p.goto(U + '/pessoas'); await p.getByRole('button', { name: /José Pereira/ }).first().click();
  await p.getByText('Perfil por domínio').waitFor(); await foto('14_perfil_jose', true);
  await p.goto(U + '/relatorios'); await p.getByText('Sessões por semana').waitFor(); await p.waitForTimeout(800); await foto('15_relatorios', true);
  await p.goto(U + '/insights'); await p.getByText('Avisos e sugestões').waitFor();
  await p.locator('summary').click(); await p.getByRole('button', { name: 'Quem precisa de atenção?' }).click();
  await foto('16_analises', true);
  // jogos (Antônio ativo)
  await p.goto(U + '/pessoas'); await p.getByRole('button', { name: /Maria Silva/ }).first().click();
  await p.getByText('Perfil por domínio').waitFor();
  await p.goto(U + '/jogos'); await p.getByText('Sessão para').waitFor(); await foto('20_jogos', true);
  await p.goto(U + '/jogos/atencao'); await foto('21_atencao_inicio');
  await p.getByRole('button', { name: 'Começar' }).click(); await p.waitForTimeout(1200);
  await p.locator('button[aria-label="Estrela"]').click(); await p.waitForTimeout(500); await foto('22_atencao_jogo');
  await p.goto(U + '/jogos/pares'); await foto('23_pares_inicio');
  await p.getByRole('button', { name: 'Começar' }).click(); await p.waitForTimeout(500);
  const cartas = p.locator('button.aspect-square'); await cartas.nth(0).click(); await cartas.nth(1).click(); await p.waitForTimeout(250); await foto('24_pares_jogo');
  await p.goto(U + '/jogos/categorias'); await foto('25_categorias_inicio');
  await p.getByRole('button', { name: 'Começar' }).click(); await p.waitForTimeout(500);
  for (const w of ['Maçã', 'Cenoura', 'Uva']) { await p.getByRole('button', { name: w, exact: true }).click(); await p.waitForTimeout(150); }
  await foto('26_categorias_jogo');
  await p.goto(U + '/jogos/imagens'); await foto('27_imagens_inicio');
  await p.getByText('Intermediário').click(); await p.waitForTimeout(300);
  let img = p.locator('button[aria-label^="Imagem "]').first(); let pal = (await img.getAttribute('aria-label')).replace('Imagem ', '');
  await img.click(); await p.getByRole('button', { name: pal, exact: true }).click();
  img = p.locator('button[aria-label^="Imagem "]').first(); await img.click(); await foto('28_imagens_jogo');
  // completa para mostrar o resultado (sem salvar)
  for (let k = 0; k < 4; k++) {
    const i2 = p.locator('button[aria-label^="Imagem "]').first(); if (!(await i2.count())) break;
    const w = (await i2.getAttribute('aria-label')).replace('Imagem ', ''); await i2.click(); await p.getByRole('button', { name: w, exact: true }).click();
  }
  await p.getByText('Salvar sessão').waitFor(); await p.fill('#obs-sessao', 'Fez com calma, pediu para repetir amanhã.'); await foto('29_resultado', true);
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
