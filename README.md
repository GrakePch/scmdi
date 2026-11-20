# SCMDI

Star Citizen Material Design Icons：为 Star Citizen 场景整理的 SVG 图标库，兼容 `@mdi/react`。

SCMDI 是独立社区项目，与 Cloud Imperium、Google、Pictogrammers 无隶属或背书关系。

## 功能

- 按中英文名称、用途和游戏动作 ID 搜索。
- 按原创、MDI 原图、MDI 改绘和游戏素材筛选；多来源图标可出现在多个分类中。
- 三档网格密度，紧凑视图只显示图标。
- 调整预览颜色和尺寸，复制 React、Path 或 SVG 使用代码。
- 下载 SVG 或透明背景 PNG；PNG 使用当前预览尺寸和颜色。
- 中英界面、深浅色主题、桌面详情面板和移动端弹窗。

## 使用路径包

在 React 项目中安装路径包和 `@mdi/react`。

```bash
npm install @grakepch/scmdi @mdi/react
```

```tsx
import Icon from '@mdi/react';
import { scmdiBrake } from '@grakepch/scmdi';

<Icon path={scmdiBrake} size={1} />;
```

主入口导出 SVG path 字符串，无运行时依赖，提供 ESM、CommonJS 和 TypeScript 声明。逐图标署名和修改声明附在路径常量旁，完整图标信息可在网站目录查看。

## 本地开发

需要 Node.js 22.12+ 与 npm。

```bash
npm install
npm run dev
```

访问终端显示的地址，默认是 `http://127.0.0.1:4186`。网站使用 React、TypeScript、Vite 和 Material Web。界面字体为 Google Sans、Noto Sans SC，代码字体为 Fira Code。

```bash
npm run check
npm test
npm run build
```

应用代码位于 `apps/catalog/`，图标源数据位于 `icons/catalog.json`，路径包位于 `packages/js/`。维护者使用 `npm run check:release` 校验发布条件。

## 许可与署名

SCMDI 项目代码及图标采用 [Apache-2.0](LICENSE)，保留各自来源、版权及修改声明。网站依赖和字体保留各自的许可证，详见 [完整许可与署名](THIRD_PARTY_NOTICES.md)。图标详情提供相应的来源记录。

本项目许可不改变 Star Citizen 原始游戏素材及商标的上游权利。
