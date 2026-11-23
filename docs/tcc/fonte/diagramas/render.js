const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2.5, viewport: { width: 1400, height: 1000 } });
  const lib = fs.readFileSync(path.join(__dirname, 'node_modules/mermaid/dist/mermaid.min.js'), 'utf8');
  await page.setContent('<html><body style="margin:0;background:#fff"><div id="c"></div></body></html>');
  await page.addScriptTag({ content: lib });
  await page.evaluate(() => mermaid.initialize({ startOnLoad: false, theme: 'base', fontFamily: 'Liberation Sans, Arial, sans-serif',
    themeVariables: { primaryColor: '#E6F2F2', primaryBorderColor: '#2C7A7A', lineColor: '#5C7070', fontSize: '15px', actorBkg: '#E6F2F2', actorBorder: '#2C7A7A' },
    flowchart: { htmlLabels: true, curve: 'basis' }, sequence: { mirrorActors: false } }));
  for (const f of fs.readdirSync(path.join(__dirname, 'src')).filter(f => f.endsWith('.mmd')).sort()) {
    const code = fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
    const svg = await page.evaluate(async (code) => { const { svg } = await mermaid.render('g' + Math.random().toString(36).slice(2), code); return svg; }, code);
    await page.evaluate((svg) => { document.getElementById('c').innerHTML = svg; const s = document.querySelector('#c svg'); s.style.maxWidth = 'none'; s.style.padding = '12px'; }, svg);
    const el = await page.$('#c svg');
    await el.screenshot({ path: path.join(__dirname, 'out', f.replace('.mmd', '.png')) });
    console.log('ok', f);
  }
  await browser.close();
})();
