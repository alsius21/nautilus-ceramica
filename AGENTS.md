## Development

When starting the React dev server, use background mode:

```
pnpm dev -- --background
```

Manage the Vite+ background server with the corresponding `vp` process controls.

## Nautilus Ceramica Direction

This is an artistic portfolio and studio website for Nautilus Ceramica. Taste, restraint, and visual craft are core requirements, not optional polish.

- Treat every UI decision as part of the studio's artistic identity; avoid generic templates, noisy decoration, and interchangeable AI-generated layouts.
- Prioritize typography, spacing, composition, materiality, and intentional interaction details. Preserve and strengthen the established visual language when extending the site.
- UI polishing is mandatory: inspect states, hover/focus behavior, transitions, hierarchy, alignment, and responsive edge cases before considering a feature complete.
- Media must display beautifully and reliably on all devices and viewport sizes. Use responsive sizing, appropriate cropping, intrinsic dimensions, accessible alternatives, and layouts that handle varied artwork aspect ratios without distortion or overflow.
- Treat performance as an SEO requirement. Optimize image delivery and loading, avoid unnecessary client-side JavaScript, protect Core Web Vitals, and keep critical content discoverable to search engines.
- Maintain semantic HTML, accessible controls, descriptive metadata, and meaningful image alt text so the work can be found and understood by artists, collectors, and search engines.
- Validate changes on narrow mobile, tablet, and wide desktop layouts, including slow-loading media and keyboard navigation where relevant.

## Documentation

Consult the React, Vite+ and React Router documentation before changing routing,
prerendering, styling or deployment behavior.
