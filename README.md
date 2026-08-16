<div align="center">

# Nautilus Ceràmica

**A quiet digital home for ceramic work, process, and place.**

[![Built with Astro](https://img.shields.io/badge/built%20with-Astro-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
[![Node.js 22+](https://img.shields.io/badge/node-22%2B-417E38?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

<p align="center">
  <img src="https://raw.githubusercontent.com/alsius21/nautilus-ceramica/main/public/images/instagram/plato_en_taller_de_hoji.webp" alt="Ceramic plate in the Hoji workshop" width="760">
</p>

## About

Nautilus Ceràmica is an editorial-style portfolio for a ceramic studio. The landing page pairs a restrained typographic system with selected studio and exhibition imagery, giving the work space to lead.

The site is intentionally small and fast: static Astro output, locally served artwork, responsive layouts, and no client-side framework overhead.

## Stack

- [Astro](https://astro.build/) for the site and static build
- [Fraunces](https://fonts.google.com/specimen/Fraunces) for display type
- [Archivo](https://fonts.google.com/specimen/Archivo) for interface text
- WebP imagery in `public/images/instagram/`

## Getting Started

### Requirements

- Node.js `>= 22.12.0`
- [pnpm](https://pnpm.io/)

### Install and run

```bash
pnpm install
pnpm dev
```

The development server is available at `http://localhost:4321` by default.

### Production build

```bash
pnpm build
pnpm preview
```

`pnpm build` generates the production-ready static site in `dist/`.

## Project Map

```text
src/
├── components/
│   ├── Footer.astro       # Copyright and Instagram link
│   └── Welcome.astro      # Landing page composition and gallery
├── layouts/
│   └── Layout.astro       # Document shell, fonts, and metadata
└── pages/
    └── index.astro        # Home route
public/
└── images/instagram/       # Studio and exhibition artwork
```

## Updating the Gallery

1. Add an optimized image to `public/images/instagram/`.
2. Add its path and a descriptive `alt` text to the `images` array in `src/components/Welcome.astro`.
3. Run `pnpm build` to verify the production output.

The Instagram profile linked by the site is [@nautilceramica](https://www.instagram.com/nautilceramica/).

## License

The source code is available for reference. Artwork and photographic assets remain the property of their respective creators and are not licensed for reuse.
