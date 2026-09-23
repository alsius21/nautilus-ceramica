# React i Vite+

Nautilus Ceramica és una aplicació React 19 amb TypeScript 7 i Vite+. El lloc es prerenderitza com a HTML estàtic sota el base path `/nautilus-ceramica/` i es publica a GitHub Pages.

## Ordres

- `pnpm dev`: servidor Vite+ de desenvolupament.
- `pnpm build`: compila React i genera HTML, sitemap, robots.txt, manifest i service worker a `dist/`.
- `pnpm preview`: serveix la sortida estàtica.
- `pnpm typecheck`: comprovació TypeScript.
- `pnpm e2e`: prerenderitza el lloc i comprova les 87 rutes públiques en mòbil i desktop amb Playwright.
- `pnpm storybook:build`: Storybook amb els components reals.

## Estructura

La implementació viu a l’arrel del projecte. El contingut editorial, les traduccions i la validació són a `src/content`, `src/i18n` i `src/lib`. Les imatges són a `public/`.

L’editor de peces i pàgines funciona durant `pnpm dev`, escriu els JSON de `src/content` i no forma part del prerender de producció.
