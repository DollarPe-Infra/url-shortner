# Design System

DollarPe URL shortener — dark control-room UI aligned with link analytics dashboard.

## Register

Product UI (internal ops tool). See [PRODUCT.md](PRODUCT.md).

## Tokens

Source of truth: [`static/css/tokens.css`](static/css/tokens.css), loaded before `styles.css` in `layout.hbs`.

**Live brand override:** [`custom/css/dollarpe.css`](custom/css/dollarpe.css) loads last and re-points `--accent` (and logo tokens) to **Proremit gold `#E8C478`**. The green `--accent` in `tokens.css` is the fallback default; the shipped accent is gold. Read "green" below as "the accent" — it resolves to gold at runtime.

### Canvas

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#000` | Page background |
| `--surface` | `#0a0a0a` | Panels, tables, inputs |
| `--surface-head` | `rgba(9,9,11,0.8)` | Table/dialog headers |
| `--surface-3` | `#27272a` | Hover fills, map landmass |
| `--border` | `rgba(255,255,255,0.08)` | Panel borders |
| `--border-soft` | `rgba(255,255,255,0.05)` | Row dividers |

### Ink

| Token | Value | Use |
|-------|-------|-----|
| `--ink` | `#fafafa` | Primary text |
| `--ink-secondary` | `#a1a1aa` | Secondary labels |
| `--ink-muted` | `#71717a` | Meta, table headers |

### Brand & semantic

| Token | Use |
|-------|-----|
| `--accent` | Primary buttons, selection, live status (Proremit gold via override; green fallback) |
| `--accent-bright` | Trend up, chart highlights |
| `--accent-ui` | UI labels (browser section) |
| `--cyan` | OS / secondary viz label |
| `--indigo` | Map/country data viz |
| `--danger` | Errors, down trends, destructive |

### Layout

| Token | Value |
|-------|-------|
| `--gap` | `8px` |
| `--radius` | `8px` |
| `--radius-sm` | `6px` |
| `--header-h` | `52px` |
| `--content-max` | `1440px` |

### Typography

- **UI:** Inter (`--font-ui`), 13–14px body, 18px section titles
- **Data:** monospace (`--font-mono`) for URLs, counts, dates
- **Table headers:** 11px uppercase, muted

## Components

### Header

52px bar, black bg, zinc bottom border. Logo 14px semibold. Nav buttons 32px height.

### Panels / tables

`--surface` background, `--border-soft` border, `--radius` corners. Header row uses `--surface-head`. Active tabs: underline (not pill tint).

### Buttons

- **Primary:** `--accent` fill, `--on-accent` text
- **Secondary:** transparent, zinc border
- **Action (icon):** 26px, transparent, tint on hover

### Forms

36px inputs, zinc border, accent focus ring. Auth/settings use compact 18px titles.

### Stats dashboard

[`static/css/stats-dashboard.css`](static/css/stats-dashboard.css) aliases `--stats-*` to global tokens. Same palette, no separate theme.

## Color rules

1. Green = action and meaningful state only (PRODUCT.md)
2. No decorative gradients or glass
3. Data viz may use `--indigo` / `--cyan` for category distinction
4. Pure black canvas; zinc borders throughout

## Files

| File | Role |
|------|------|
| `static/css/tokens.css` | Design tokens |
| `static/css/styles.css` | Global components |
| `static/css/stats-dashboard.css` | Analytics layout |
| `custom/css/dollarpe.css` | Brand override hook |
