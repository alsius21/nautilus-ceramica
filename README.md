<div align="center">

# Nautilus Ceràmica

**Una llar digital serena per a la ceràmica, el procés i el lloc.**

[![Built with Astro](https://img.shields.io/badge/built%20with-Astro-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
[![Node.js 22+](https://img.shields.io/badge/node-22%2B-417E38?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

<p align="center">
  <img src="https://raw.githubusercontent.com/alsius21/nautilus-ceramica/main/public/images/works/plat-de-taller/plato_en_taller_de_hoji.webp" alt="Plat de ceràmica al taller Hoji" width="760">
</p>

## Sobre el projecte

Nautilus Ceràmica és un portafolis de caràcter editorial per a l'estudi de ceràmica de **Zara Castillo Martínez**. La pàgina d'inici combina un sistema tipogràfic sobri amb una selecció d'imatges del taller i d'exposicions, deixant que les peces siguin les protagonistes.

El lloc és intencionadament petit i ràpid: sortida estàtica amb Astro, obra servida localment, composició adaptable i sense el pes d'un framework de client. També és una **aplicació web progressiva (PWA)**: la instal·la des del navegador, funciona sense connexió gràcies al *service worker* i té una icona pròpia a la pantalla d'inici.

## Idiomes

- **Documentació del projecte:** català
- **Idiomes del lloc web:** català (per defecte, a `/`), castellà (`/es/`) i anglès (`/en/`)

## Tecnologies

- [Astro](https://astro.build/) per al lloc i la compilació estàtica
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) per al *service worker*, el manifest d'aplicació i l'ofuscació offline
- [Fraunces](https://fonts.google.com/specimen/Fraunces) per a la tipografia de display
- [Archivo](https://fonts.google.com/specimen/Archivo) per al text d'interfície
- Imatges WebP a `public/images/`

## Posada en marxa

### Requisits

- Node.js `>= 22.12.0`
- [pnpm](https://pnpm.io/)

### Instal·lació i desenvolupament

```bash
pnpm install
pnpm dev
```

El servidor de desenvolupament estarà disponible per defecte a `http://localhost:4321`.

### Worktrees de Git

Cada worktree és una còpia de treball independent, però comparteix l'historial i
les branques del repositori. És una manera segura de treballar en una funcionalitat
mentre es manté `main` neta:

```bash
git worktree add ../nautilus-ceramica-feature -b feature/nom-de-la-funcionalitat main
cd ../nautilus-ceramica-feature
pnpm install --frozen-lockfile
pnpm dev
```

Les dependències (`node_modules/`), la sortida (`dist/`) i els fitxers generats per
Astro (`.astro/`) són locals a cada worktree i estan exclosos de Git. Per executar
diversos worktrees alhora, crea un `.env` a cadascun a partir de `.env.example` i
assigna un port diferent:

```bash
PORT=4322 pnpm dev
```

Per veure, eliminar o netejar worktrees:

```bash
git worktree list
git worktree remove ../nautilus-ceramica-feature
git worktree prune
```

### Compilació de producció

```bash
pnpm build
pnpm preview
```

`pnpm build` genera el lloc estàtic preparat per a producció dins de `dist/`.

## Estructura del projecte

```text
src/
├── components/
│   ├── Footer.astro       # Copyright i enllaç a Instagram
│   └── Welcome.astro      # Composició de la pàgina d'inici, galeria i selector d'idioma
├── content/
│   ├── works.json         # Obres: títols, descripcions, slugs, imatges, dates i botiga (ca/es/en)
│   ├── exhibitions.json   # Exposicions (ca/es/en)
│   └── about.json          # Pàgina «Sobre mi» (ca/es/en)
├── dev/
│   └── editor-i18n.ts       # Textos de l'editor (ca/es/en)
├── lib/
│   └── content.ts         # Capa de contingut: tipus, validació i accés a les dades
├── i18n/
│   └── index.ts           # Diccionari de textos: català, castellà, anglès
├── layouts/
│   └── Layout.astro       # Estructura del document, fonts, metadades i manifest PWA
├── pwa.ts                 # Registre del service worker (virtual:pwa-register)
└── pages/
    ├── index.astro        # Inici en català a `/`
    ├── es/
    │   └── index.astro    # Versió castellana a `/es/`
    └── en/
        └── index.astro    # Versió anglesa a `/en/`
public/
├── images/
│   ├── works/              # Imatges d'obres (galeria i botiga)
│   ├── exhibitions/        # Imatges d'exposicions
│   └── instagram/          # Àrea de tria, mai publicada
├── pwa-192x192.png         # Icona PWA (192 px)
├── pwa-512x512.png         # Icona PWA (512 px)
├── pwa-maskable-512x512.png# Icona maskable (512 px)
└── apple-touch-icon.png    # Icona per a dispositius Apple (180 px)
tools/
└── content-editor.mjs      # Integració de desenvolupament: ruta i desament de peces
```

## Actualitzar el contingut (sense tocar codi)

Tot el contingut editorial viu a `src/content/` com a JSON versionats, amb
textos en català, castellà i anglès. `src/lib/content.ts` els valida en cada
build: si falta un idioma, un slug o un text alternatiu, el build falla dient
exactament on.

- **Obres** (`src/content/works.json`): títol, descripció, meta (SEO),
  slugs per idioma, taller (`hoji` | `llotja`), dates (`madeAt` de fabricació
  opcional; `addedAt` i `updatedAt` automàtiques en desar), imatges (`file` =
  ruta sota `public/images` sense extensió + `alt` per idioma; vegeu la
  convenció d'imatges més avall) i botiga (`available`, `status`, `price`,
  `dimensions`).
- **Exposicions** (`src/content/exhibitions.json`): mateixa idea + `url` opcional.
- **Sobre mi** (`src/content/about.json`): titular, entradeta i seccions.

Per afegir una peça: puja la imatge optimitzada (WebP) a
`public/images/works/<slug>/`, afegeix una entrada a `works.json` amb els tres
idiomes i executa `pnpm build` per verificar. Els textos d'interfície
(navegació, botons, formularis) segueixen a `src/i18n/index.ts` i no cal
tocar-los.

### Descoberta de peces a la botiga

Pla implementat en tres parts: classificació a l'editor, cerca i filtres a la
botiga, i connexions entre fitxes. La galeria conserva la seva presentació.

- `category` és opcional: `vase`, `cup`, `bowl`, `plate`, `bottle`, `juicer`,
  `sculpture` o `other`. Els noms es mostren traduïts en ca/es/en.
- `size` és una classificació editorial opcional (`small`, `medium`, `large`),
  independent del text de dimensions. No s'infereix de fotografies.
- `tags` conté etiquetes separades per comes en ca/es/en per descriure acabats,
  materials o col·leccions. Es gestionen des de l'editor.
- La cerca ignora accents i majúscules. Els filtres es combinen i es poden
  compartir amb `?q=...&category=vase&size=small`.
- Les recomanacions mostren fins a tres peces publicades a la botiga amb
  categoria o etiquetes compartides, prioritzant les que no estan venudes ni
  reservades. La mida només ajuda a ordenar coincidències; no crea una relació
  per si sola. Sense coincidències, no apareix la secció.
- Sense JavaScript, el catàleg i els enllaços continuen accessibles; la cerca
  i els filtres s'activen al navegador.

Validació de la lògica: `node --experimental-strip-types --test tools/shop-discovery.test.mjs`
(Node 22.12 o superior). Compilació completa: `pnpm build`.

### Convenció d'imatges

El camp `file` és una ruta relativa sota `public/images/` **sense extensió**;
l'extensió sempre és `.webp`. L'estructura és:

```text
public/images/
├── works/            # Obres (galeria i botiga): works/<work.id>/<nom>
├── exhibitions/      # Exposicions: exhibitions/<nom>
└── instagram/        # Àrea de tria; mai referenciada al contingut
```

- **Obres:** `file` = `works/<work.id>/<nom-sense-extensió>`. L'editor genera
  `<nom> = <id>-NN` (`01`, `02`…); les peces migrades conserven el nom original.
- **Exposicions:** `file` = `exhibitions/<nom-sense-extensió>` (carpeta plana).
- **Excepció:** l'obra `calabaza-a-la-llotja` reutilitza
  `exhibitions/exposicion_calabaza_en_llotja`; no es duplica ni es mou.
- **Galeria i botiga** comparteixen les imatges de `works/<id>/`; no hi ha
  carpeta pròpia de botiga.
- `src/lib/content.ts` valida la convenció en cada build: un `file` que no
  comenci per `works/` o `exhibitions/`, que contingui `..` o que apunti a
  `instagram/` fa fallar la compilació.

### Editor de contingut (només en desenvolupament)

Amb `pnpm dev` en marxa, la galeria mostra un botó **+ Nova peça** que obre
l'editor, una pàgina normal sota `src/pages/` amb la seva ruta localitzada:
`/contingut/peces/afegir` (i `/es/contenido/piezas/crear`,
`/en/content/pieces/add`). Per **editar**, cada pàgina de peça mostra un enllaç
**Editar peça** cap a `/contingut/peces/editar/<id>` (i les versions es/en).
Des d'allà pots escriure el títol, la descripció, la data de fabricació
opcional, afegir i **retallar** fotografies (marc arrossegable i relacions
d'aspecte) i desar:

- les imatges es converteixen a WebP i es desen a `public/images/works/<id>/`;
- l'entrada s'afegeix o s'actualitza a `src/content/works.json`, amb les dates
  d'alta i d'edició automàtiques (`updatedAt` canvia en editar);
- en desar, l'editor et porta a la pàgina de la peça perquè vegis com ha quedat.

L'editor és només per a desenvolupament: el punt de desament només existeix amb
`astro dev` i `astro build` treu les pàgines de l'editor de `dist/` i del
sitemap, així que no arriben a producció.

El perfil d'Instagram enllaçat al lloc és [@nautilceramica](https://www.instagram.com/nautilceramica/).

## Llicència

El codi font està disponible com a referència. Les obres i els recursos fotogràfics continuen sent propietat dels seus creadors i no tenen llicència per a la reutilització.
