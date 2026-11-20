# SCMDI path package

Star Citizen SVG icon paths compatible with `@mdi/react`.

Install the path package with `@mdi/react` for React usage.

```sh
npm install @grakepch/scmdi @mdi/react
```

```tsx
import Icon from '@mdi/react';
import { scmdiBrake } from '@grakepch/scmdi';

<Icon path={scmdiBrake} size={1} />;
```

The root entry exports SVG path strings with no runtime dependencies. ESM, CommonJS and TypeScript declarations are included. Paths use a `0 0 24 24` viewBox.

The ESM and CommonJS files include source attribution and modification notices next to the relevant path exports. The website catalog provides full icon details.

## License

SCMDI code and catalog icons are provided under Apache-2.0. See `LICENSE`, `THIRD_PARTY_NOTICES.md` and the comments next to the path exports for applicable copyright and attribution notices. This license does not relicense original Star Citizen game assets or trademarks.

SCMDI is an independent community project and is not affiliated with or endorsed by Cloud Imperium, Google or Pictogrammers.
