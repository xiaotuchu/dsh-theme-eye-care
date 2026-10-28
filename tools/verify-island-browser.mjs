// Browser fixture for the real ModuleLoader bundle. Pass a React 18 node_modules
// directory and a Playwright entry path; neither is a runtime dependency.
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
const html = `<!doctype html><meta charset="UTF-8"><title>Island theme fixture</title>
<style>
*{box-sizing:border-box}body{margin:0;font:14px/1.6 system-ui;color:var(--dsw-alias-label-primary,#222);background:var(--dsw-alias-bg-base,#fff);--dsw-radius-xl:16px;--dsw-static-neutral-bluish-400:#888;--dsw-alias-border-l2:#ddd;--dsw-alias-border-l4:#ddd;--dsw-alias-bg-module-platform:#eee}
#root,.demo_frame{min-height:100vh;background:var(--dsw-alias-bg-base,#fff)}.demo_frame{display:grid;grid-template-columns:230px minmax(0,1fr)}.demo_sidebarCol{padding:24px 16px;background:var(--dsw-specific-sidebar-fill,#f5f5f5)}button{font:inherit;cursor:pointer}.demo_newSession{width:100%;padding:8px}.demo_sessionRow{padding:8px}.demo_centerCol{padding:26px 36px}.demo_markdown_content{max-width:640px}h1{font-size:28px}h2{font-size:22px}.demo_card{margin-top:30px;background:var(--dsw-specific-input-major,#f5f5f5);padding:16px}.demo_card [contenteditable]{min-height:40px}.demo_primary{float:right;border:0;border-radius:50%}#settings{max-width:700px;margin:20px auto;padding:22px;background:var(--dsw-alias-bg-layer-2,#fff);border:1px solid var(--dsw-alias-border-l3,#ddd);border-radius:16px}.md-code-block{max-width:600px}.demo_bannerWrap{position:relative}.demo_banner{padding:10px}pre{padding:12px}#mode{position:fixed;right:16px;top:12px}
</style>
<div id="root"><div class="demo_frame"><aside class="demo_sidebarCol" data-side="sidebar"><div data-slot="sidebar"><h3 class="demo_brand">DeepSeek Harness</h3><button class="demo_newSession">新会话</button><p class="demo_sessionRow demo_selected">示例会话</p><p class="demo_sessionRow">工作区文件</p></div></aside>
<main class="demo_centerCol" data-phase="ready"><article class="demo_markdown_content" data-conversation-scroll><h1>岛屿主题</h1><p>奶油色的界面，绿色强调色与叶片装饰。</p><h2>文件和代码</h2><p>打开 <code>example.md</code> 继续工作。</p><div class="md-code-block"><div class="demo_bannerWrap"><div class="demo_banner">JavaScript</div></div><pre>const theme = 'island';</pre></div></article><div class="demo_card"><div contenteditable>发送消息…</div><button class="demo_primary">↑</button></div><div id="settings" role="dialog"><div data-slot="settings.header">设置 · 通用</div><div id="settings-row"></div></div></main></div></div>
<button id="mode">切换深色</button>
<script>${react}</script><script>${reactDom}</script>
<script>window.__ModuleLoader__={load:r=>window.registration=r};</script><script>${client}</script>
<script>
const plugin=registration.factory(name=>{if(name==='react')return React;throw Error(name)});
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
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(pathToFileURL(resolve('artifacts/island-preview.html')).href);
  await page.getByRole('button', { name: '豆绿', exact: true }).click();
  const baseline = await page.locator('.demo_centerCol').boundingBox();
  await page.screenshot({ path: 'artifacts/native-background.png' });
  await page.getByRole('button', { name: '岛屿', exact: true }).click();
  assert.equal(await page.locator('[data-eye-care-section="background"]').count(), 0);
  assert.deepEqual(await page.locator('.demo_centerCol').boundingBox(), baseline, 'Island must not move the native layout');
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
  assert.equal(await page.getByRole('button', { name: '豆绿', exact: true }).getAttribute('aria-pressed'), 'true');
  assert.equal(await page.evaluate(() => getComputedStyle(document.body,'::before').backgroundImage), 'none');
  await page.setViewportSize({ width: 720, height: 900 });
  await page.getByRole('button', { name: '岛屿', exact: true }).click();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.evaluate(() => cleanup());
  assert.equal(await page.locator('body').getAttribute('data-eye-care-theme'), null);
  assert.deepEqual(errors, []);
  console.log('Browser fixture passed: theme/background switching, unchanged layout, local artwork, reload, dark mode, narrow width and cleanup.');
} finally { await browser.close(); }
