# DSH 护眼主题

**中文** ｜ [English](README.en.md)

为 **DeepSeek Harness** 提供「原生主题」与「岛屿」两种外观。原生主题可选择背景配色；岛屿提供完整的配色、背景图和界面装饰。

## 安装

### 桌面版

打开 **添加插件**，安装源选择 **npm 官方源**，输入 `@xiaotuchu/dsh-theme-eye-care`，安装后按提示重启 DSH。

### Web 版

```sh
dsh plugin --profile web add "@xiaotuchu/dsh-theme-eye-care"
```

安装后重启对应的 DSH 服务。桌面版使用命令行安装时，将 `web` 换成 `desktop`。

## 卸载

```sh
dsh plugin --profile web remove "@xiaotuchu/dsh-theme-eye-care"
```

桌面版将 `web` 换成 `desktop`。按提示重启后恢复 DSH 原有外观。

## 功能

在 **设置 → 通用** 中选择主题，修改立即生效。

### 原生主题

保留 DSH 原有布局与组件外观，通过「背景色」下拉菜单选择配色。

| 背景色 | 外观 |
| --- | --- |
| 暖纸 | 偏暖的米黄色，默认配色 |
| 豆绿 | 淡绿色背景 |
| 暖灰 | 中性偏暖的灰色 |
| 原生 | 使用 DSH 自带配色 |

![原生主题的三套背景配色](preview.png)

### 岛屿主题

- 奶油色与绿色搭配，加入岛屿背景图和叶片标题。
- 为侧边栏、输入框和设置页提供统一外观。
- 聊天及 Markdown 内容中的代码块使用圆角卡片与彩色圆点；独立源码文件保持原生预览样式。
- 适配 [File Tree](https://github.com/xiaotuchu/dsh-file-tree)，背景图可延伸到文件树区域。
- 输入区与底部状态栏保留遮挡，聊天文字不会透过底部区域。

岛屿使用独立配色，不叠加原生主题的背景色。切回原生主题时，会恢复之前选择的背景色。

### 设置与深色模式

- 记住主题和背景色选择，同一来源的多个窗口之间同步设置。
- 跟随 DSH 的浅色、深色或系统设置；深色模式下使用对应配色，岛屿隐藏浅色背景图和装饰。
- 支持中文与英文，跟随 DSH 的界面语言。

岛屿部分样式依赖 DSH 的组件结构，后续 DSH 更新时可能需要相应适配。

## 许可

插件原创代码及原生背景配色采用 [MIT](LICENSE) 许可。

岛屿背景图及改编外观来自 [Animal Island UI](https://github.com/guokaigdg/animal-island-ui)，保留 **CC BY-NC 4.0（署名—非商业性使用）** 许可。详见 [第三方声明](THIRD_PARTY_NOTICES.md)。