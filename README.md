# SCMDI

English · [简体中文](README.zh-CN.md) · [npm package](https://www.npmjs.com/package/@grakepch/scmdi)

Star Citizen Material Design Icons (SCMDI) is a collection of SVG icon paths for Star Citizen controls and actions. Use the paths with `@mdi/react` or render them directly in an SVG with a `0 0 24 24` viewBox.

## Use an icon

For React, install the path package and renderer together.

```sh
npm install @grakepch/scmdi @mdi/react
```

```tsx
import Icon from '@mdi/react';
import { scmdiBrake } from '@grakepch/scmdi';

<Icon path={scmdiBrake} size={1} />;
```

`@grakepch/scmdi` exports SVG path strings as named ESM and CommonJS exports, includes TypeScript declarations, and has no runtime dependencies. Each path export carries its applicable attribution and modification notices.

## Browse the catalog

- Search by English or Chinese name, purpose, or in-game action ID.
- Filter by source to find original designs, unchanged Material Design Icons (MDI), MDI adaptations, or icons based on game assets. An icon can match more than one source.
- Choose from three grid sizes. The smallest shows just the icons.
- Set the preview color and size, copy a React example, SVG path, or SVG markup, or download an SVG or transparent PNG. PNG exports use the preview dimensions and color.
- Switch between English and Chinese or light and dark themes. Select an icon to open its details in a desktop panel or a mobile dialog.

## Local development

Use Node.js 22.12 or later and npm. From the repository root, run:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The default is `http://127.0.0.1:4186`. The catalog uses React, TypeScript, Vite, and Material Web, with Google Sans and Noto Sans SC for the interface and Fira Code for code samples.

```sh
npm run check
npm test
npm run build
```

The catalog app lives in `apps/catalog/`, the icon data in `icons/catalog.json`, and the npm package in `packages/js/`. Run `npm run check:release` to validate the icon records before publishing.

## License and attribution

SCMDI code and catalog icons are licensed under Apache 2.0. The catalog lists the sources for each icon. Dependencies and fonts retain their own licenses. See the [license](LICENSE) and [third-party notices](THIRD_PARTY_NOTICES.md).

SCMDI is an independent community project, unaffiliated with and without endorsement from Cloud Imperium, Google, or Pictogrammers. Rights to the original Star Citizen game assets and trademarks remain with their respective owners.
