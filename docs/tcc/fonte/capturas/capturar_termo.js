// Captura as telas do termo, de Minha conta e do novo aceite (cria e exclui uma conta de teste).
const { chromium } = require('playwright');
const U = 'http://localhost:8443', A = 'http://localhost:8000';
const D = __dirname + '/telas/';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'pt-BR', acceptDownloads: true });
  const p = await ctx.newPage();
  const erros = []; p.on('pageerror', e => erros.push(e.message));
  const email = `teste${Date.now()}@exemplo.com`;
  // cadastro com link do termo
  await p.goto(U + '/cadastro');
  await p.fill('input[placeholder="Seu nome"]', 'Carla Teste'); await p.fill('input[type=email]', email);
  const s = p.locator('input[placeholder="••••••••"]'); await s.nth(0).fill('frase longa de teste'); await s.nth(1).fill('frase longa de teste');
  const [aba] = await Promise.all([ctx.waitForEvent('page'), p.getByRole('link', { name: /termo de uso e política/ }).click()]);
  await aba.waitForLoadState(); await aba.getByText('15. Legislação aplicável').waitFor();
  await aba.screenshot({ path: D + '30_termo.png' }); await aba.close();
  await p.check('input[type=checkbox]'); await p.getByRole('button', { name: 'Próximo' }).click();
  await p.fill('input[placeholder="(00) 00000-0000"]', '(41) 99999-0000'); await p.selectOption('select', 'Familiar');
  await p.getByRole('button', { name: 'Próximo' }).click(); await p.getByText('Pular esta etapa').click();
  await p.waitForURL(U + '/'); console.log('cadastro ok');
  // minha conta
  await p.getByRole('button', { name: 'Minha conta' }).click(); await p.waitForURL(U + '/conta');
  await p.getByText(/Você aceitou a versão 2026-11/).waitFor(); await p.screenshot({ path: D + '31_conta.png', fullPage: true });
  const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: 'Exportar meus dados' }).click()]);
  const conteudo = JSON.parse(require('fs').readFileSync(await dl.path(), 'utf8')); console.log('export cuidador:', conteudo.cuidador.email === email);
  // simula termo antigo: registra aceite de versão anterior pela API
  const tok = await p.evaluate(async (A) => (await (await fetch(A + '/auth/refresh', { method: 'POST', credentials: 'include' })).json()).access_token, A);
  await p.evaluate(async ([A, t]) => fetch(A + '/conta/aceite', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify({ versao_termo: '2026-01' }) }), [A, tok]);
  await p.goto(U + '/'); await p.getByText('O termo de uso foi atualizado').waitFor(); await p.screenshot({ path: D + '32_novo_aceite.png' });
  await p.check('input[type=checkbox]'); await p.getByRole('button', { name: 'Aceitar e continuar' }).click();
  await p.getByText('Pessoas').first().waitFor(); console.log('novo aceite ok');
  // exclusão
  await p.goto(U + '/conta'); await p.getByRole('button', { name: 'Quero excluir minha conta' }).click();
  await p.fill('#confirmar-exclusao', 'excluir'); await p.getByRole('button', { name: 'Excluir definitivamente' }).click();
  await p.waitForURL('**/entrar'); 
  await p.fill('input[type=email]', email); await p.fill('input[type=password]', 'frase longa de teste'); await p.click('button[type=submit]');
  await p.getByText(/incorretos/).waitFor(); console.log('conta excluída: login recusado');
  console.log('erros:', erros); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
