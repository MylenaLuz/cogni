// Captura as telas de papéis e instituição para o TCC. Requer o seed de demonstração recém-gerado.
const { chromium } = require('playwright');
const U = 'http://localhost:8443';
const D = __dirname + '/telas/';
(async () => {
  const b = await chromium.launch();
  async function entrar(email) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'pt-BR' });
    const p = await ctx.newPage();
    await p.goto(U + '/entrar'); await p.fill('input[type=email]', email); await p.fill('input[type=password]', 'cuidar-com-dados');
    await p.click('button[type=submit]'); await p.waitForURL(U + '/'); await p.getByText('Pessoas').first().waitFor();
    return { p, ctx };
  }
  let { p, ctx } = await entrar('carla@cogni.app');
  await p.goto(U + '/pessoas'); await p.getByText('Helena Costa').first().waitFor(); await p.waitForTimeout(300);
  await p.screenshot({ path: D + '50_papeis_lista.png' });
  await p.getByRole('button', { name: /Maria Silva/ }).first().click(); await p.getByText('Perfil por domínio').waitFor();
  await p.waitForTimeout(300); await p.screenshot({ path: D + '51_acompanhante.png' });
  await p.goto(U + '/conta'); await p.getByText('Recebi um código de convite').waitFor();
  await p.locator('section', { hasText: 'Recebi um código de convite' }).scrollIntoViewIfNeeded();
  await p.evaluate(() => window.scrollBy(0, -120)); await p.waitForTimeout(300);
  await p.screenshot({ path: D + '52_conta_convite.png' });
  await ctx.close();
  ({ p, ctx } = await entrar('demo@cogni.app'));
  await p.getByRole('button', { name: /Antônio Lima/ }).first().click(); await p.getByText('Perfil por domínio').waitFor();
  await p.getByRole('button', { name: 'Gerar código' }).click(); await p.locator('strong.tracking-widest').waitFor();
  const card = p.locator('section', { hasText: 'Quem acompanha' });
  await card.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  await card.screenshot({ path: D + '53_quem_acompanha.png' });
  await ctx.close();
  ({ p, ctx } = await entrar('gestor@cogni.app'));
  await p.goto(U + '/instituicao'); await p.getByText('Pessoas da instituição').waitFor(); await p.waitForTimeout(300);
  await p.screenshot({ path: D + '54_instituicao.png', fullPage: true });
  await ctx.close(); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
