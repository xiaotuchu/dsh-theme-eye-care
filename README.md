# 护眼配色 Eye-care palettes

> Three switchable low-glare themes for the **DeepSeek Harness** web GUI — warm paper, eye green and warm grey. Each theme is a complete `--dsw-alias-*` token layer with a light and a dark face, switched from **Settings → General**.

DeepSeek Harness 的护眼配色插件。三套底色，在**设置 → 通用**里一键切换，选择立即生效并记住。

![三套配色预览](preview.png)

上图由 `scripts/render-preview.py` 从 `themes/*.json` 直接渲染，色值取的就是主题文件里的真实数值。

## 三套配色

| 主题 | 主底 | 抬升面 | 强调 / 边框 | id |
| --- | --- | --- | --- | --- |
| 暖纸 | `#f5f0e1` | `#e8e5d9` | `#e0d9b7` | `warm-paper`（默认） |
| 护眼绿 | `#eef7ed` | `#e2efe0` | `#4f765f` | `eye-green` |
| 护眼灰 | `#f2f0ec` | `#e9e6e0` | `#dcd8cf` | `warm-grey` |

三套都以浅色为主，切到深色模式时给同色系的「夜版」（暖夜褐 / 深绿夜 / 暖灰夜），不会出现浅色底配深色边框那样的错配。

正文墨色不用纯黑而是调和过的深色，边框用各自底色的半透明而不是中性灰，所以整屏色系是统一的。

## 切换

- **位置**：设置 → 通用，紧跟在内置的「外观」和「字号」两行之后（槽位 `settings.general.item`，`order: 12`）。
- **样式**：方块按钮，沿用「外观」那行的视觉规则——`border-radius: var(--dsw-radius-xl)`、`.5px` 描边、上下 `20px` 内边距、竖排（色块充当图标位）、`:hover` 用 `interactive-bg-hover`、选中态用 `bg-module-platform` 填充 + `neutral-bluish-400` 描边。一处有意不同：等分宽度（`flex: 1 1 0`，最小 88px）而不是固定 `180px` 基准，这样四个方块刚好排满一行。
- **选项**：三套配色 + 一个 **DSH 默认**（撤掉覆盖层，回到当前的深浅色主题）。
- **立即生效**：切换只是换一层覆盖，不需要重启或刷新。
- **记住**：写在 `localStorage`，键是固定的 `dsh-theme-eye-care:palette`（与包名解耦，所以作者以后改包名也不会重置用户的选择）。
- **多窗口同步**：监听 `storage` 事件，另一个窗口切换时本窗口跟着换。
- 文案全中文，单语。

## 工作原理

DSH 的主题系统有两条路，本插件走第二条：

- `ctx.theme.register({ id, colorScheme, tokens })` —— 注册一个主题。但**单独 register 并不等于生效**：内置的「外观」行只列 `light / dark / system`，第三方 id 只在进程内有效、不落盘，而且它的 `tokens` 是**裸字符串**（一个值要同时应付明暗两种配色）。走这条路得自己写 store、自己持久化、每次刷新手动重新选中。
- `ctx.theme.overrideTokens(source, tokens)` —— 往**当前激活主题**上叠一层 token 覆盖层，值必须是 `{ light, dark }` 成对给。它不动用户的深浅色偏好，`ctx.effect` 把 disposer 绑到插件生命周期上，切换就是「撤旧层 + 叠新层」。

渲染侧由 `dsh-client-ui-layout` 执行 `body.style.setProperty(name, value)`，inline 样式压过样式表；每次 apply 会先撤掉上一批 token，所以覆盖层只需要写一部分变量。`--dsw-*` 只是 CSS 自定义属性名，presenter 不做名字校验，所以名字对得上就生效。

### 每套主题覆盖什么

每套 **146 个 token**，结构完全一致（校验脚本强制三套的名字集合完全相同）：

| 类别 | 数量 | 说明 |
| --- | --- | --- |
| `--dsw-alias-*` | 107 | 官方 alias 阶梯，**全覆盖**（背景、文字、边框、交互态、diff、状态、菜单、tooltip、onboarding…） |
| `--dsw-specific-*` / `--dsw-menu-*` | 14 | 侧边栏填充、侧边栏选中/悬停、气泡、输入框、菜单面 |
| `--dsw-static-*` | 16 | 见下 |
| `--shiki-token-*` | 9 | 代码块语法高亮 |
| `--dsw-linear-gradient-*` | 2 | 思考块的淡出渐变 |

### 浅色表面 = 底色，不往白漂

第一版把抬升面做得比底色更亮（底色 `#f5f0e1`，而 `bg-layer-1/2` 给了 `#fdfbf5`），结果**设置面板**——它正好用 `bg-layer-1/2` 上色——整块变成近白：实测截图里 **89% 的像素是 `#fdfbf5`**，底色压根没露出来。

对照官方浅色主题：`bg-base`、`bg-layer-1/2/3` **全都是 `#fff`**，层级完全靠 `--dsw-elevation-*`（描边 + 阴影）表达，不靠更亮的填充。本插件按这个语义把 15 个「亮面」token 全部收敛到各自的 `bg-base`，明暗层次改由**更深的**层级承担：`bg-module-platform`、`bg-overlay`、代码块、边框。深色模式例外——那里更亮的填充才是正确的抬升线索。

校验规则第 7 条守着这条设计：任何亮面 token 比 `bg-base` 亮超过 0.01 亮度就报错。

### 为什么要覆盖 `--dsw-static-*`

static 是原始色阶，本来由 alias 层挡住就够。但扫描 `app.asar` 里全部 6138 个 js 文件统计 `var(--dsw-static-*)` 的实际引用方后，发现 **13 个 static 被非主题包直接消费**（deliverables、plan、schedule、sidebar-right、primitives、web-frontend、conversation、agent-preset）。不覆盖它们，浅色底上会冒出冷白/冷灰斑块。于是这 13 个加上 3 个黑白色锚点共 16 个纳入主题。

这 16 个的 light/dark 值**刻意相同**：static 是原始色阶，官方样式表本身也只在 `body{}` 里声明一次、不分模式，组件按模式自己选用不同名字（浅色用 `neutral-50`、深色用 `neutral-850`）。跟着官方语义走才不会把深色模式的层次搞乱。

### 状态色与语法高亮在三套里刻意一致

`state-success/error/warn-*`、`code-diff-*`、`file-diff-*`、`shiki-token-*`、`label-deep-diving*` 这些 token 在三套主题里**逐字节相同**——它们表达的是语义（成功是绿的、报错是红的、diff 增删），不是配色风格，换底色不该让报错不再像报错。校验脚本会拒绝语义 token 在主题之间漂移。

## 安装

```powershell
# 从 npm
dsh plugin --profile desktop add "@xiaotuchu/dsh-theme-eye-care"

# 从 GitHub（无需构建：lib/client.js 已随仓库提交）
dsh plugin --profile desktop add "git+https://github.com/xiaotuchu/dsh-theme-eye-care.git"

# 从本地目录
dsh plugin --profile desktop add "C:\path\to\dsh-theme-eye-care"
```

把 `desktop` 换成 `web` 也可以（两者都在 `dsh.compatibility.profiles` 里声明）。

装完**需要重启 DSH**：客户端插件名册在启动时组装（`dsh-client-modules` 的 owning-tree base URL 在重启前不变），热更新只覆盖已注册模块的改动、不会引入新插件。

本包**故意不带 `prepare` / 构建脚本**，`lib/client.js` 是构建好提交的——所以从 git URL 安装时不会踩 pnpm 默认禁止运行构建脚本（`allowBuilds`）的坑，装完即用。

## 目录

```
.
├── package.json                 # dsh.bundle.patch + dsh.client 声明
├── cordis.patch.yml             # 往 profile 的 loader 名册插入本插件的行
├── themes/
│   ├── warm-paper.json          # 暖纸
│   ├── eye-green.json           # 护眼绿
│   └── warm-grey.json           # 护眼灰
├── lib/
│   ├── index.js                 # 宿主半边：空 apply，只为让 client bundle 被发现
│   └── client.js                # 生成物：三套配色 + 切换行 + 持久化
├── preview.png                  # 预览图（渲染自 themes/*.json）
└── scripts/
    ├── build-client.js          # themes/*.json -> lib/client.js
    ├── check-theme.js           # token 名校验 / 对比度 / 跨主题一致性
    ├── test-client-contract.js  # 用 stub React 真跑 bundle，含点击切换
    ├── verify-install.mjs       # 调用 DSH 自己的 dsh-app-boot 验证装配
    ├── render-preview.py        # 渲染 preview.png（需要 Pillow）
    ├── sample-screenshot.py     # 采样真实截图的主色，定位「这块颜色是哪个 token 画的」
    ├── snapshot-official-tokens.js
    └── official-tokens.json     # 官方 token 名单快照
```

宿主半边（`lib/index.js`）是空的，但不能省：`dsh-client-modules` 靠遍历 loader 行来发现 `dsh.client` 声明，没有这一行，浏览器永远不会去请求 client bundle。它刻意不声明 cordis `inject`——加上 `webServer` 之类依赖会让这行在没有该服务的 profile 里永远 pending，而这一行只需要被挂载、不需要被激活。

## 开发与验证

```powershell
npm run build     # themes/*.json -> lib/client.js
npm test          # check-theme.js + test-client-contract.js
npm run preview   # 渲染 preview.png（需要 Python + Pillow）
```

四层验证，都是真跑出来的：

**1. `scripts/check-theme.js` —— 配色数据（三套一起验）**

1. **token 名必须在官方名单里**——名单是从官方 `@deepseek-ai/dsh-client-ui-theme` 样式表快照出来的 414 个名字（107 个 alias）。打错一个字母会静默变成无效 CSS 变量，这里会直接报错。
2. **每个值必须是 `{ light, dark }` 两个字符串**——`overrideTokens` 对裸字符串会抛异常。
3. **三套主题的 token 名集合必须完全相同**，否则某套会静默缺失某个颜色。
4. **对比度**：`label-primary / secondary / tertiary / caption` 在四种表面上、明暗两套模式下都要过 WCAG 门槛。用绝对阈值而不是「和官方一样」——浅色底色的对比度上限约 18.4:1（纯白能到 21:1），要求达到官方纯白底的比值在数学上不可能。
5. **跨主题颜色泄漏**：三套之间**不允许共用任何非语义色值**。这条抓到过真实 bug——第一版生成器用带空格的原文去 search 无空格的 key，`rgba()` 三元组全部替换失败，绿色主题的边框/遮罩其实还在用黄色底色；单看对比度完全发现不了（两者都是深色低透明度，看起来差不多）。
6. **语义 token 三套逐字节相同**，防止状态色漂移。
7. **浅色表面不能比底色更亮**（容差 0.01 亮度），守着上面那条设计决定。

**2. `scripts/test-client-contract.js` —— 客户端 bundle（44 项）**

用 stub 真跑一遍 `lib/client.js`：拦下 `window.__ModuleLoader__.load`，拿 `registration.id` 和包名比对（`client-modules` 在 id 不匹配时会直接报 "loaded without registering"）；stub `window.localStorage`、`document`、`ctx.slots`、`ctx.effect` 和主题服务，再用一个最小 React stub（`useState` / `useEffect` / `createElement`）把切换行真渲染出来、**模拟点击按钮**，断言：槽位与 id 正确、默认叠一层、点击换层并写存储、选「DSH 默认」清空所有层、`storage` 事件跨窗口同步、卸载时撤层并注销监听与样式表、每个 token 都是 `{light,dark}` 字符串对。

**3. `scripts/verify-install.mjs` —— 安装装配（不用重启）**

直接调用 DSH 自己的 `dsh-app-boot`：读 profile 清单、`bundlePatchPaths` + `loadOverlayPatches` 把 patch 解析成行、`composeEntries` 组合出最终 entry 列表，断言行真的在里面且未被 disable，并确认要服务给浏览器的 client bundle 存在且以包名自注册。

```powershell
$env:ELECTRON_RUN_AS_NODE=1
& "<DSH 安装目录>\DeepSeek Harness.exe" --expose-internals "<本包>\scripts\verify-install.mjs"
```

**4. `scripts/render-preview.py` —— 视觉检查**

对比度数字管不了「色系协不协调」，所以把每套主题的界面面貌实际画出来看一眼。预览图的描边和半透明填充**按真实 alpha 合成**——浅色表面统一到底色之后，描边是唯一的层级线索，画成不透明会把层次美化掉。`scripts/sample-screenshot.py` 可以采样一张真实截图里最常出现的颜色，把「这块看着偏白」直接定位到是哪个 token 在画它。

### 对比度实测

`主底 / 抬升面`（`--dsw-alias-bg-base` / `--dsw-alias-bg-module-platform`）：

| 主题 | 模式 | primary | secondary | tertiary | caption | link |
| --- | --- | --- | --- | --- | --- | --- |
| 暖纸 | light | 10.93 / 9.86 | 6.36 / 5.74 | 5.30 / 4.78 | 3.29 / 2.97 | 5.24 |
| 暖纸 | dark | 13.11 / 10.75 | 8.59 / 7.04 | 6.09 / 4.99 | 3.69 / 3.03 | 8.32 |
| 护眼绿 | light | 12.05 / 11.10 | 6.68 / 6.16 | 5.49 / 5.06 | 3.44 / 3.17 | 4.69 |
| 护眼绿 | dark | 13.13 / 10.65 | 8.82 / 7.15 | 6.16 / 5.00 | 4.56 / 3.70 | 7.95 |
| 护眼灰 | light | 11.90 / 10.88 | 6.85 / 6.26 | 5.78 / 5.28 | 3.75 / 3.43 | 4.94 |
| 护眼灰 | dark | 13.19 / 11.02 | 8.39 / 7.01 | 5.72 / 4.78 | 4.18 / 3.50 | 7.38 |

门槛：primary ≥9、secondary ≥5.5、tertiary ≥4.5、caption ≥2.5、link ≥4.5。

## 改配色 / 加第四套

改 `themes/<id>.json` 的 `tokens`，然后 `npm run build && npm test`。

每套主题顶部的 `ramp` 是它用到的完整色阶（三套主题共用同一套 `ramp` 键名），改 `tokens` 时从这里取值色系不会跑偏；`source` 记的是原始输入色，也是切换按钮上那个小色块的颜色。

加第四套：复制 `themes/warm-paper.json` 成 `themes/<new-id>.json`，改 `id` / `displayName` / `source` / `tokens`，`npm run build` 即可——切换行会自动多出一个按钮（`THEMES` 是从目录里读出来的），校验脚本会强制新主题的 token 名集合与前几套一致。

### 关于 `scripts/official-tokens.json`

它是从本机安装的 DSH 里抽取的 **414 个 CSS 变量名**（`--dsw-*` / `--shiki-*`），用途是让校验脚本能拒绝打错的 token 名。这里放的是**功能性接口标识符**，不含官方任何代码或样式表内容；DSH 升级后用下面的命令重新生成即可（读的是你本机安装）：

```powershell
node scripts/snapshot-official-tokens.js "<DSH>\resources\app.asar.unpacked\dsh\node_modules\@deepseek-ai\dsh-client-ui-theme\lib\client.js" 0.2.0-rc.2
```

或者用 `--official <路径>` 让 `check-theme.js` 直接对着你本机的官方样式表校验。

## 与其它主题插件共存

别的主题插件通常走 `theme.register()`（注册一个真正的主题定义），本插件走 `overrideTokens()`，是叠在**当前激活主题之上**的一层。`ThemeRuntime.composeActive()` 先把激活主题的 tokens 复制一份，再按层序把覆盖层的值逐个盖上去——所以**本插件覆盖到的 token 名以本插件为准，与注册先后无关**；没覆盖到的名字则由其它插件决定。切到「DSH 默认」时撤掉本插件的层，下面的主题就露出来了。

## 卸载

```powershell
dsh plugin --profile desktop remove @xiaotuchu/dsh-theme-eye-care
```

本插件不改动任何 DSH 自带文件——不动 `app.asar`、不动 `workbench`、不动内置样式表，所有改动只通过运行时往 `body` 写 inline CSS 变量生效，所以卸载是干净的。

## 已知边界

- 主题靠 inline 样式变量生效，某个组件若用 `!important` 写死颜色会盖过本主题（DSH 自带样式表没有这种情况）。
- 覆盖层是「叠在激活主题之上」而不是替换：多个主题插件同时叠层时按注册顺序组合，逐个 token 后者胜出。
- 切换选择存在 `localStorage`，是**按 origin** 的。桌面版把端口固定为 `19387` 所以重启保留；用别的端口开 web profile 会是新 origin，回到默认值。
- 只覆盖官方 token 名，不发明新变量（校验脚本会拒绝不在官方名单里的名字）。
- 切换行渲染的是自带样式的原生 `<button>`（用主题变量着色），没有用 `dsh-client-ui-primitives`——少一个依赖，视觉上与内置「外观」行的方块保持一致。

## 测试环境

- DSH `0.2.0-rc.2`（desktop profile），Windows 10 22H2
- `package.json` 里声明的最低版本是 `>=0.1.7-rc.1`
- 开发需要 Node ≥20；`npm run preview` 额外需要 Python 与 Pillow

## 许可

MIT © 2026 Xiaotu — 见 [LICENSE](LICENSE)。