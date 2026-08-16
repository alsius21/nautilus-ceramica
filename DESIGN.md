# Nautilus Ceràmica — Decisions de disseny

Registre viu de les decisions visuals i tipogràfiques del lloc de l'estudi. Mantén-lo al dia; llegeix-lo abans de fer canvis de disseny.

## Marca i to

- Lloc de portfolio artístic i estudi per a Nautilus Ceràmica (ceràmica).
- El gust, la contenció i l'ofici visual per sobre de la decoració. Res de plantilles genèriques ni efectes sorollosos.
- El lloc ha de transmetre calidesa, artesania i orgànic —com el material— sense caure en el kitsch.

## Tipografia

Parella: **Fraunces Variable** (display) + **Archivo Variable** (UI).

- Autoallotjada amb `@fontsource-variable` (variable, subsetjada, woff2 — sense peticions externes de fonts).
- Importada globalment a `src/layouts/Layout.astro`:
  - `@fontsource-variable/fraunces/full.css` (tots els eixos: opsz, wght, SOFT, WONK)
  - `@fontsource-variable/archivo` (wght)
- Cos / etiquetes petites en majúscules: `'Archivo Variable'`, amb `-webkit-font-smoothing: antialiased` i `optimizeLegibility`.
- Nom de la marca (`h1`): `'Fraunces Variable'`, pes 400, `font-optical-sizing: auto`, `font-variation-settings: 'SOFT' 40, 'WONK' 1`, `letter-spacing: -0.055em`, `line-height: 0.9`.
  - `SOFT` i `WONK` són els eixos de caràcter artesà. Ajusta dins de SOFT 0–100 / WONK 0–1.
  - Alternatives si la mirada es desvia: WONK 0 per a una serif més neta, o la itàlica de Fraunces per a una paraula d'accent («Ceràmica»).

## Paleta

- Tinta: `#29251f`
- Paper: `#eee9e1`, base de pàgina `#e8e5dc`
- Verds celadon i gris-blaus suaus, usats només com a rentats radials/lineals molt febles (alfa 0.15–0.5) per mantenir el paper net.

## Composició

- La landing és una única pàgina d'estudi: capçalera amb la marca, galeria de dues imatges amb treballs seleccionats i peu de pàgina.
- Peu de pàgina fixat a la part baixa de la viewport (`.home` és una columna flex, la galeria `flex: 1 0 auto`, el peu `margin-top: auto`), amb `min-height: 100dvh` en pantalles petites.
- Galeria: graella de dues columnes (`1.15fr / 0.85fr`), la segona obra amb desplaçament vertical, i col·lapse a una sola columna per sota de 640px.
- Mitjans: dimensions intrínseques, `display: block`, escala suau en hover (700ms cubic-bezier) amb interruptor de `prefers-reduced-motion`.

## Moviment

- Deriva orgànica lenta «celadon-flow» sobre els rentats de fons (bucles de 18–25s).
- El mode de moviment reduït desactiva tota animació i transició d'imatges.

## Pàgines d'obra (plantilla tipus diari)

- **Requisit:** una plantilla de pàgina reutilitzable —amb estructura de diari/blog— que doni a cada peça la seva pròpia pàgina, a banda de la galeria de la home.
- Cada pàgina d'obra ha d'incloure, com a mínim: **títol** de la peça i **descripció** lliure (materials, procés, textura, anècdotes del taller).
- **Galeria en lloc d'imatge única:** una peça pot mostrar diverses fotografies (vistes, detalls, procés) en lloc d'un sol retrat; quan una obra té més d'una imatge, la pàgina ha de presentar-les com a galeria, mai com a imatges soltes.
- La plantilla ha de seguir el llenguatge visual existent: tipografia, espaiat, línies de pèl i integració dins del fons del `<main>` —res de fons propi—, igual que les seccions actuals.
- Cada pàgina ha d'estar disponible a les tres llengües (ca/es/en), amb títol, descripció i textos alternatius centralitzats al diccionari `src/i18n/index.ts`.

## Registre de decisions

- **2026-08-16** — Tipografia: es substitueix Georgia/font de sistema per Fraunces Variable + Archivo Variable (autoallotjada). Direcció escollida: display serif artesà i càlid + UI grotesca neutra.
- **2026-08-16** — Composició: la home es reconstrueix com a landing d'estudi; el peu de pàgina queda fixat a la part baixa de la viewport; `min-height: 100dvh`.
- **2026-08-16** — i18n: tres llengües — català (per defecte, sense prefix a `/`), castellà (`/es/`) i anglès (`/en/`). Diccionari central a `src/i18n/index.ts`; `Astro.currentLocale` alimenta el `lang` del document, els textos i el selector d'idioma de la capçalera (estil meta, enllaç actiu amb `aria-current`).
- **2026-08-16** — Requisit implementat: plantilla reutilitzable de pàgines d'obra (estil diari) amb títol, descripció, galeria opcional i rutes localitzades per a ca/es/en.
- **2026-08-16** — PWA: el lloc passa a ser instal·lable i a funcionar offline. `vite-plugin-pwa` s'integra a la capa de Vite; com que `@vite-pwa/astro` no cobreix Astro 7, el muntatge del SW es replica al config (generació del `sw.js` des de l'`astro:build:done`). Icones pròpies: espiral de nàutil en tinta sobre paper, amb rentat celadon (192/512/512 maskable/180 Apple). El manifest usa `start_url` i `scope` relatius (`.`) per resoldre's correctament sota el base path `/nautilus-ceramica/`. Precache de totes les pàgines per llengua, tipografies (woff2) i obra en WebP; `theme-color` i meta tags d'iOS al `<head>`. El SW es registra des de `src/pwa.ts` (auto-update, sense prompt).
