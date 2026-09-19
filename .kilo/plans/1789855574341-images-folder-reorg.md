# Estàndard d'imatges de `public/images/` (reorganització)

## Abast

Aquest pla **no** construeix cap formulari/editor. L'editor d'obres l'està fent
una altra sessió. Aquí només es:

1. Defineix l'estàndard de carpetes d'imatge.
2. Reorganitza les imatges existents per complir-lo.
3. Actualitza `works.json` i la documentació.
4. Afegeix una guarda de validació de la convenció.
5. Deixa un **contracte de handoff** perquè la sessió de l'editor hi convergisca
   (no s'edita aquí cap fitxer de l'editor/formulari).

## Estàndard (font de veritat)

```text
public/images/
├── works/            # imatges de galeria + botiga (totes surten de works.json)
│   ├── aceitera/
│   ├── bol-de-taller/
│   ├── jarron/
│   ├── jarron-alt/
│   ├── jarron-pf/
│   ├── peces-descacs/
│   └── plat-de-taller/
├── exhibitions/      # imatges d'exposicions (exhibitions.json)
└── instagram/        # pendents de classificar (.gitkeep; mai referenciada)
```

Regles:

- `file` = ruta relativa sota `public/images/` **sense extensió**; l'extensió
  sempre és `.webp`.
- Obres: `works/<work.id>/<nom-sense-extensió>`. L'editor nou generarà
  `<nom> = <id>-NN` (`01`, `02`…); les peces migrades conserven el nom original.
- Exposicions: `exhibitions/<nom-sense-extensió>` (pla).
- Excepció documentada: l'obra `calabaza-a-la-llotja` reutilitza
  `exhibitions/exposicion_calabaza_en_llotja`. No es duplica ni es mou.
- `instagram/` és àrea de tria: cap entrada de `works.json`/`exhibitions.json`
  hi pot apuntar.
- Botiga i galeria **comparteixen** les imatges de `works/<id>/`: `Gallery.astro`
  i `Shop.astro` (línia 31) fan servir `work.images[0].file`; `ShopJournal`/
  `WorkJournal` fan servir totes les imatges. Per tant no hi ha carpeta pròpia de
  botiga.

## Context (per què el canvi de codi és mínim)

Tot es compon des del camp `file`:

- `src/lib/content.ts:240` i `:245` → `images/${file}.webp` (og:image).
- Components → `${base}images/${image.src}.webp`.

No cal tocar cap component. Només moure fitxers, actualitzar `file` i validar.

## Tasques

### 1. Moure fitxers (`git mv`, mantenint noms)

| Actual | Destí |
| --- | --- |
| `public/images/aceitera/` | `public/images/works/aceitera/` |
| `public/images/jarron/` | `public/images/works/jarron/` |
| `public/images/jarron-alt/` | `public/images/works/jarron-alt/` |
| `public/images/jarron-pf/` | `public/images/works/jarron-pf/` |
| `public/images/chess/` | `public/images/works/peces-descacs/` |
| `public/images/gallery/plato_en_taller_de_hoji.webp` | `public/images/works/plat-de-taller/plato_en_taller_de_hoji.webp` |
| `public/images/gallery/bol_en_taller_de_hoji.webp` | `public/images/works/bol-de-taller/bol_en_taller_de_hoji.webp` |

Eliminar `public/images/gallery/` un cop buida. `exhibitions/` i `instagram/`
queden igual.

### 2. Actualitzar `src/content/works.json` (camp `file`)

- `gallery/plato_en_taller_de_hoji` → `works/plat-de-taller/plato_en_taller_de_hoji`
- `gallery/bol_en_taller_de_hoji` → `works/bol-de-taller/bol_en_taller_de_hoji`
- `chess/proyecto-dama_en_taller-de-hoji` → `works/peces-descacs/proyecto-dama_en_taller-de-hoji`
- `chess/proyecto-alfil-negro_en_taller-de-hoji` → `works/peces-descacs/proyecto-alfil-negro_en_taller-de-hoji`
- `jarron/jarron-08-26_01` → `works/jarron/jarron-08-26_01` (i `_02`, `_03`)
- `aceitera/aceitera_taller-de-hoji` → `works/aceitera/aceitera_taller-de-hoji` (i `-02`)
- `jarron-alt/jarron-alto_taller-de-hoji` → `works/jarron-alt/jarron-alto_taller-de-hoji` (i `-02`)
- `jarron-pf/jarron-pf` → `works/jarron-pf/jarron-pf`
- `exhibitions/exposicion_calabaza_en_llotja` → **sense canvi**
- `exhibitions.json` → **sense canvi**

### 3. Guarda de la convenció a `src/lib/content.ts`

A `checkImage` (o als loaders), fer fallar el build amb missatge clar si:

- `file` conté `..` o comença per `/`;
- `file` comença per `instagram/` (no publicable);
- `file` **no** comença per `works/` ni `exhibitions/`.

Comprovar que tots els valors actuals compleixen. Actualitzar el comentari de
`ContentImage` (`:23`) perquè descrigui la convenció.

### 4. Documentació `README.md`

- Línia 13: URL raw → `.../public/images/works/plat-de-taller/plato_en_taller_de_hoji.webp`.
- Línia 33: `public/images/instagram/` → `public/images/`.
- Línia 115 (arbre): reflectir `images/works/`, `images/exhibitions/`, `images/instagram/`.
- Línies 131 i 136: destí `public/images/works/<slug>/`.
- Afegir un bloc breu «Convenció d'imatges» amb les regles de dalt.

## Handoff a la sessió de l'editor/formulari (NO implementar aquí)

La reorganització trenca l'editor actual si no s'hi alinea. Contracte exacte que
ha d'aplicar la sessió propietària (fitxers `tools/content-editor.mjs` i
`src/dev/content-editor.astro`):

- `tools/content-editor.mjs:90` — `file: \`${slugCa}/${slugCa}-NN\`` →
  `file: \`works/${slugCa}/${slugCa}-NN\``.
- `tools/content-editor.mjs:299` — `targetDir = path.join(root, 'public', 'images', work.id)`
  → `path.join(root, 'public', 'images', 'works', work.id)`.
  Crear el pare abans: `mkdir(path.join(root,'public','images','works'), { recursive: true })`,
  i mantenir `mkdir(targetDir, { recursive: false })` per conservar la guarda
  `EEXIST` anti-slug-duplicat.
- Comentari capçalera (`:13`) i text de `src/dev/content-editor.astro:168`
  (`public/images/&lt;slug&gt;/` → `public/images/works/&lt;slug&gt;/`).
- Nota per a l'editor: habilitar per botiga no requereix carpeta nova; la botiga
  reutilitza `works/<id>/` (cal com a mínim `images[0]`).

Si la sessió de l'editor prefereix fer el canvi de rutes ella mateixa, aquest pla
no ha d'incloure'l i només deixa la convenció escrita.

## Riscos

- **URLs antigues**: les imatges canvien de ruta; les URL antigues donarien 404.
  GitHub Pages estàtic no fa redireccions per fitxer. Acceptable si no hi ha
  enllaços externs a imatges individuals.
- **`og:image`**: canvia d'URL; les cachés socials es refresquen amb el temps.
- **Service worker**: `workbox.globPatterns` fa glob de `**.webp`; regenera el
  precache (`cleanupOutdatedCaches: true`).
- **Guarda nova**: si queda algun `file` fora de `works/`/`exhibitions/`, el build
  falla; és l'objectiu.
- **Finestra de desincronització**: si l'editor es desa abans d'aplicar el
  contracte, crearà una peça amb rutes antigues. Aplicar el handoff abans de
  tornar a usar l'editor en dev.
- **`git mv` + renombrat** (`chess` → `peces-descacs`): Git ho detecta com a
  renombrat si els continguts no canvien.

## Validació

1. No queden rutes antigues: cercar `gallery/`, `chess/`, `jarron/` (sense
   `works/`) a `src/content/*.json` i al codi.
2. Existència real: per a cada `images[].file` de works i exhibitions, confirmar
   que `public/images/<file>.webp` existeix a disc.
3. `pnpm build` passa (inclou la guarda de convenció).
4. `astro dev --background` i revisar imatges a inici (`/`), galeria (`/galeria`),
   fitxa d'obra, botiga (`/botiga`) i exposicions (`/exposicions`), en ca/es/en.
5. Comprovar `<meta property="og:image">` en una fitxa d'obra i una d'exposició.

## Fora d'abast

- Construir el formulari/editor d'obres (altra sessió).
- Formulari/editor d'exposicions (si s'afegeix, seguirà `exhibitions/<slug>/`).
- Classificar el contingut de `instagram/`.
- Redireccions d'URLs antigues d'imatge.
