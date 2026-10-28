// Browser fixture for the real ModuleLoader bundle. Pass a React 18 node_modules
// directory and a Playwright entry path; neither is a runtime dependency.
// First run prepare-host-preview.mjs against your installed DSH app.asar.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const [reactModules, playwrightEntry] = process.argv.slice(2);
if (!reactModules || !playwrightEntry) throw new Error('Usage: node tools/verify-island-browser.mjs <react-node_modules> <playwright/index.mjs>');
await mkdir('artifacts', { recursive: true });
const [react, reactDom, client] = await Promise.all([
  readFile(join(reactModules, 'react/umd/react.development.js'), 'utf8'),
  readFile(join(reactModules, 'react-dom/umd/react-dom.development.js'), 'utf8'),
  readFile('lib/client.js', 'utf8')
]);
// Host component fixture is extracted from the installed DSH frontend, with its
// application boot removed. It stays under ignored artifacts, never in the plugin.
const html = `<!doctype html><meta charset="UTF-8"><title>Island theme fixture</title>
<link rel="stylesheet" href="host-primitives-fixture.css">
<style>
:root{--dsw-radius-sm:6px;--dsw-radius-md:10px;--dsw-radius-lg:12px;--dsw-elevation-prominent:0 4px 20px #0002;--dsw-menu-backdrop-filter:none}
*{box-sizing:border-box}body{margin:0;font:14px/1.6 system-ui;color:var(--dsw-alias-label-primary,#222);background:var(--dsw-alias-bg-base,#fff);--dsw-radius-xl:16px;--dsw-static-neutral-bluish-400:#888;--dsw-alias-border-l2:#ddd;--dsw-alias-border-l4:#ddd;--dsw-alias-bg-module-platform:#eee}
#root,.demo_frame{min-height:100vh;background:var(--dsw-alias-bg-base,#fff)}.demo_frame{display:grid;grid-template-columns:230px minmax(0,1fr)}.demo_sidebarCol{padding:24px 16px;background:var(--dsw-specific-sidebar-fill,#f5f5f5)}button{font:inherit;cursor:pointer}.demo_newSession{width:100%;padding:8px}.demo_sessionRow{padding:8px}.demo_centerCol{padding:26px 36px}.demo_markdown_content{max-width:640px}h1{font-size:28px}h2{font-size:22px}.demo_card{margin-top:30px;background:var(--dsw-specific-input-major,#f5f5f5);padding:16px}.demo_card [contenteditable]{min-height:40px}.demo_primary{float:right;border:0;border-radius:50%}#settings{max-width:700px;margin:20px auto;padding:22px;background:var(--dsw-alias-bg-layer-2,#fff);border:1px solid var(--dsw-alias-border-l3,#ddd);border-radius:16px}.md-code-block{max-width:600px}.demo_bannerWrap{position:relative}.demo_banner{padding:10px}pre{padding:12px}#mode{position:fixed;right:16px;top:12px}
</style>
<div id="root"><div class="demo_frame"><aside class="demo_sidebarCol" data-side="sidebar"><div data-slot="sidebar"><h3 class="demo_brand">DeepSeek Harness</h3><button class="demo_newSession">新会话</button><p class="demo_sessionRow demo_selected">示例会话</p><p class="demo_sessionRow">工作区文件</p></div></aside>
<main class="demo_centerCol" data-phase="ready"><article class="demo_markdown_content" data-conversation-scroll><h1>岛屿主题</h1><p>奶油色的界面，绿色强调色与叶片装饰。</p><h2>文件和代码</h2><p>打开 <code>example.md</code> 继续工作。</p><div class="md-code-block"><div class="demo_bannerWrap"><div class="demo_banner">JavaScript</div></div><pre>const theme = 'island';</pre></div></article><div class="demo_card"><div contenteditable>发送消息…</div><button class="demo_primary">↑</button></div><div id="settings" role="dialog"><div data-slot="settings.header">设置 · 通用</div><div id="settings-row"></div></div></main></div></div>
<button id="mode">切换深色</button>
<script>${react}</script><script>${reactDom}</script>
<script src="host-primitives-fixture.js"></script>
<script>window.React=fixtureHost.React;window.ReactDOM=fixtureHost.ReactDOM;</script>
<script>window.__ModuleLoader__={load:r=>window.registration=r};</script><script>${client}</script>
<script>
const plugin=registration.factory(name=>{if(name==='react')return React;if(name==='@deepseek-ai/dsh-client-ui-primitives')return fixtureHost.primitives;throw Error(name)});
let currentTokens=null, dictionaries;
function paint(){for(const key of Object.keys(currentTokens||{}))document.body.style.setProperty(key,currentTokens[key][document.body.hasAttribute('data-ds-dark-theme')?'dark':'light']);}
const theme={overrideTokens(source,next){const prev=currentTokens;for(const key of Object.keys(prev||{}))document.body.style.removeProperty(key);currentTokens=next;paint();return()=>{if(currentTokens!==next)return;for(const key of Object.keys(next))document.body.style.removeProperty(key);currentTokens=null;}}};
const locale={register(ns,m){dictionaries=m;return()=>{}},resolveText:t=>typeof t==='string'?t:t.zh};
plugin.apply({get:k=>({theme,locale})[k],effect:fn=>{window.cleanup=fn()},slots:{inject:(name,fn)=>fn(),register:(d,C)=>{ReactDOM.createRoot(document.getElementById('settings-row')).render(React.createElement(C,{t:k=>dictionaries.zh[k]}));return()=>{}}}});
document.getElementById('mode').onclick=()=>{document.body.toggleAttribute('data-ds-dark-theme');paint()};
</script>`;
await writeFile('artifacts/island-preview.html', html);
const { chromium } = await import(pathToFileURL(resolve(playwrightEntry)).href);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(5000);
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(pathToFileURL(resolve('artifacts/island-preview.html')).href);
  const background = page.getByRole('button', { name: '背景色', exact: true });
  await background.click();
  await page.getByRole('menuitem', { name: '豆绿', exact: true }).click();
  assert.equal(await background.getAttribute('aria-expanded'), 'false');
  const baseline = await page.locator('.demo_centerCol').boundingBox();
  await page.screenshot({ path: 'artifacts/native-background.png' });
  await background.click();
  const menu = page.getByRole('menu');
  await menu.waitFor();
  assert.equal(await page.locator('select').count(), 0, 'no OS-native select remains');
  assert.ok(await menu.evaluate(el => parseFloat(getComputedStyle(el).borderRadius) > 0), 'native menu has rounded corners');
  await page.screenshot({ path: 'artifacts/native-background-menu.png' });
  await page.keyboard.press('Escape');
  assert.equal(await background.getAttribute('aria-expanded'), 'false');
  await background.focus();
  await page.keyboard.press('ArrowDown');
  await page.getByRole('menu').waitFor();
  await page.keyboard.press('Escape');
  await background.click();
  await page.getByRole('heading', { name: '岛屿主题', exact: true }).click();
  assert.equal(await background.getAttribute('aria-expanded'), 'false');
  await page.getByRole('button', { name: '岛屿', exact: true }).click();
  assert.equal(await page.locator('[data-eye-care-section="background"]').count(), 0);
  assert.deepEqual(await page.locator('.demo_centerCol').boundingBox(), baseline, 'Island must not move the native layout');
  // DSH uses the same .md-code-block primitive for standalone source previews.
  // Only Markdown descendants should receive the Island card decoration.
  await page.evaluate(() => {
    const samples = document.createElement('section');
    samples.id = 'code-context-regression';
    const block = '<div class="md-code-block"><div class="demo_bannerWrap"><div class="demo_banner">代码</div></div><pre><code>example</code></pre></div>';
    for (const extension of ['json', 'js', 'ts', 'py', 'yaml', 'css', 'html']) {
      const preview = document.createElement('div');
      preview.dataset.codePreview = extension;
      preview.innerHTML = block;
      samples.append(preview);
    }
    for (const context of ['conversation', 'document']) {
      const markdown = document.createElement('div');
      markdown.className = 'demo_markdown_content';
      markdown.dataset.markdownContext = context;
      markdown.innerHTML = block;
      samples.append(markdown);
    }
    document.querySelector('main').append(samples);
  });
  for (const preview of await page.locator('#code-context-regression [data-code-preview]').all()) {
    assert.equal(await preview.locator('.md-code-block').evaluate(el => getComputedStyle(el).borderRadius), '0px', 'source preview must not gain a Markdown card');
    assert.equal(await preview.locator('.demo_bannerWrap').evaluate(el => getComputedStyle(el, '::before').content), 'none', 'source preview must not gain decorative dots');
    assert.equal(await preview.locator('.demo_bannerWrap').evaluate(el => getComputedStyle(el).paddingLeft), '0px', 'source toolbar must retain its original spacing');
  }
  for (const markdown of await page.locator('[data-markdown-context]').all()) {
    assert.equal(await markdown.locator('.md-code-block').evaluate(el => getComputedStyle(el).borderRadius), '14px');
    assert.equal(await markdown.locator('.demo_bannerWrap').evaluate(el => getComputedStyle(el, '::before').content), '""');
  }
  await page.locator('#code-context-regression').evaluate(el => el.remove());
  // Reproduce the host's sticky composer mask and File Tree's opaque panel.
  // The native gradient becomes fully opaque after 36px, covering the footer.
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = '.demo_composerSeat{background:linear-gradient(180deg,transparent 0px,var(--dsw-alias-bg-base) 36px);position:absolute;bottom:0;left:0;right:0;padding:36px 12px 8px;z-index:7}.fp-host{background:var(--dsw-alias-bg-base);border-left:.5px solid var(--dsw-alias-border-l3)}';
    document.head.append(style);
    const sample = document.createElement('div');
    sample.id = 'surface-regression';
    sample.style.cssText = 'display:grid;grid-template-columns:2fr 1fr;height:200px;position:relative;margin:20px';
    sample.innerHTML = '<section style="position:relative;overflow:hidden"><div style="position:absolute;bottom:0">这段聊天文字不应透过底部区域<br>这段聊天文字不应透过底部区域<br>这段聊天文字不应透过底部区域</div><div class="demo_composerSeat" data-composer-seat><div class="demo_card" style="margin:0">发送消息…</div><footer>5 轮 · 160 tok/s · 缓存命中率 85%</footer></div></section><aside class="fp-host"><div class="fp-toolbar">筛选文件…</div><div class="fp-scroll">▾ example<br>　folder<br>　README.md</div></aside>';
    document.querySelector('main').append(sample);
  });
  const composerMask = await page.locator('[data-composer-seat]').evaluate(el => getComputedStyle(el).backgroundImage);
  assert.match(composerMask, /linear-gradient/, 'keep the host mask so conversation text cannot bleed through the composer/footer');
  assert.equal(await page.locator('.fp-host').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'File Tree should reveal the same Island artwork as its adjacent preview');
  await page.locator('#surface-regression').screenshot({ path: 'artifacts/island-surfaces.png' });
  await page.getByRole('button', { name: '切换深色', exact: true }).click();
  assert.notEqual(await page.locator('.fp-host').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'dark File Tree retains its opaque surface');
  await page.getByRole('button', { name: '切换深色', exact: true }).click();
  await page.getByRole('button', { name: '原生主题', exact: true }).click();
  assert.notEqual(await page.locator('.fp-host').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'leaving Island restores the native File Tree surface');
  await page.getByRole('button', { name: '岛屿', exact: true }).click();
  const art = await page.evaluate(async () => {
    const css = getComputedStyle(document.body,'::before');
    const img = new Image(); img.src = css.backgroundImage.slice(5,-2); await img.decode();
    return { width: img.naturalWidth, display: css.display, pointerEvents: css.pointerEvents };
  });
  assert.ok(art.width > 0); assert.equal(art.pointerEvents, 'none');
  await page.screenshot({ path: 'artifacts/island-light.png' });
  await page.reload();
  await page.getByRole('button', { name: '岛屿', exact: true }).waitFor();
  assert.equal(await page.locator('body').getAttribute('data-eye-care-theme'), 'island');
  await page.getByRole('button', { name: '切换深色', exact: true }).click();
  assert.equal(await page.evaluate(() => getComputedStyle(document.body,'::before').display), 'none');
  await page.screenshot({ path: 'artifacts/island-dark.png' });
  await page.getByRole('button', { name: '原生主题', exact: true }).click();
  assert.match(await background.textContent(), /豆绿/);
  assert.equal(await page.evaluate(() => getComputedStyle(document.body,'::before').backgroundImage), 'none');
  await page.setViewportSize({ width: 720, height: 900 });
  await page.getByRole('button', { name: '岛屿', exact: true }).click();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.evaluate(() => cleanup());
  assert.equal(await page.locator('body').getAttribute('data-eye-care-theme'), null);
  assert.deepEqual(errors, []);
  console.log('Browser fixture passed: source/Markdown code styles, composer mask, File Tree surfaces, native menu selection/keyboard/dismissal, theme/background switching, unchanged layout, local artwork, reload, dark mode, narrow width and cleanup.');
} finally { await browser.close(); }
