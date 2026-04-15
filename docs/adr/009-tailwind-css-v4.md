# ADR-009: Tailwind CSS v4

## Status
Accepted

## Context
The app needs consistent, responsive styling with minimal custom CSS. Options:

1. Tailwind CSS (utility-first)
2. CSS Modules
3. Styled Components / Emotion (CSS-in-JS)

Tailwind is the default choice for Next.js projects in the ecosystem. Tailwind
v4 (released 2025) was chosen because it is the current major version.

## Decision
Use **Tailwind CSS v4** via the `@tailwindcss/postcss` PostCSS plugin.

Key v4 differences from v3:
- Configuration is done in CSS via `@theme { }` blocks in `globals.css` rather
  than `tailwind.config.js`
- The PostCSS plugin replaces the old `tailwindcss` plugin
- JIT mode is the only mode; no `purge` config needed
- CSS cascade layers are used internally

Styling is applied entirely via utility classes in JSX. No CSS Modules or
global stylesheets beyond `globals.css` (imports Tailwind layers + font vars).

## Consequences
**Positive**
- Consistent design from utility classes; no naming collisions
- Tailwind v4 JIT is fast — Turbopack integration works well
- Responsive utilities (`sm:`, `lg:`) enable layout adaptation without media query
  boilerplate

**Negative**
- Tailwind v4 is relatively new; some third-party tooling (linters, VS Code
  plugins) still flagged `@theme` as an unknown at-rule
- No design token system beyond Tailwind defaults — custom colors/spacing would
  require `@theme` configuration
- JSX class strings can become long and hard to read for complex components
- `animate-fade-in` referenced in `Toast.tsx` has no definition in `globals.css`
  — the animation class does not actually exist
