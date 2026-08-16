<div align="center">

# Nautilus Ceràmica

**Una llar digital serena per a la ceràmica, el procés i el lloc.**

[![Built with Astro](https://img.shields.io/badge/built%20with-Astro-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
[![Node.js 22+](https://img.shields.io/badge/node-22%2B-417E38?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

<p align="center">
  <img src="https://raw.githubusercontent.com/alsius21/nautilus-ceramica/main/public/images/instagram/plato_en_taller_de_hoji.webp" alt="Plat de ceràmica al taller Hoji" width="760">
</p>

## Sobre el projecte

Nautilus Ceràmica és un portafolis de caràcter editorial per a l'estudi de ceràmica de **Zara Castillo Martínez**. La pàgina d'inici combina un sistema tipogràfic sobri amb una selecció d'imatges del taller i d'exposicions, deixant que les peces siguin les protagonistes.

El lloc és intencionadament petit i ràpid: sortida estàtica amb Astro, obra servida localment, composició adaptable i sense el pes d'un framework de client.

## Idiomes

- **Documentació del projecte:** català
- **Idiomes del lloc web:** català (per defecte, a `/`), castellà (`/es/`) i anglès (`/en/`)

## Tecnologies

- [Astro](https://astro.build/) per al lloc i la compilació estàtica
- [Fraunces](https://fonts.google.com/specimen/Fraunces) per a la tipografia de display
- [Archivo](https://fonts.google.com/specimen/Archivo) per al text d'interfície
- Imatges WebP a `public/images/instagram/`

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
├── i18n/
│   └── index.ts           # Diccionari de textos: català, castellà, anglès
├── layouts/
│   └── Layout.astro       # Estructura del document, fonts i metadades
└── pages/
    ├── index.astro        # Inici en català a `/`
    ├── es/
    │   └── index.astro    # Versió castellana a `/es/`
    └── en/
        └── index.astro    # Versió anglesa a `/en/`
public/
└── images/instagram/       # Obra del taller i d'exposicions
```

## Actualitzar la galeria

1. Afegeix una imatge optimitzada a `public/images/instagram/`.
2. Afegeix-ne la ruta a l'array `images` de `src/components/Welcome.astro` i el text alternatiu a les tres llengües a `src/i18n/index.ts`.
3. Executa `pnpm build` per verificar la sortida de producció.

El perfil d'Instagram enllaçat al lloc és [@nautilceramica](https://www.instagram.com/nautilceramica/).

## Llicència

El codi font està disponible com a referència. Les obres i els recursos fotogràfics continuen sent propietat dels seus creadors i no tenen llicència per a la reutilització.
