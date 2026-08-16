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

Nautilus Ceràmica és un portafolis de caràcter editorial per a un estudi de ceràmica. La pàgina d'inici combina un sistema tipogràfic sobri amb una selecció d'imatges del taller i d'exposicions, deixant que les peces siguin les protagonistes.

El lloc és intencionadament petit i ràpid: sortida estàtica amb Astro, obra servida localment, composició adaptable i sense el pes d'un framework de client.

## Idiomes

- **Documentació del projecte:** català
- **Idiomes previstos del lloc web:** català, castellà i anglès

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
│   └── Welcome.astro      # Composició de la pàgina d'inici i galeria
├── layouts/
│   └── Layout.astro       # Estructura del document, fonts i metadades
└── pages/
    └── index.astro        # Ruta d'inici
public/
└── images/instagram/       # Obra del taller i d'exposicions
```

## Actualitzar la galeria

1. Afegeix una imatge optimitzada a `public/images/instagram/`.
2. Afegeix-ne la ruta i un text `alt` descriptiu a l'array `images` de `src/components/Welcome.astro`.
3. Executa `pnpm build` per verificar la sortida de producció.

El perfil d'Instagram enllaçat al lloc és [@nautilceramica](https://www.instagram.com/nautilceramica/).

## Llicència

El codi font està disponible com a referència. Les obres i els recursos fotogràfics continuen sent propietat dels seus creadors i no tenen llicència per a la reutilització.
