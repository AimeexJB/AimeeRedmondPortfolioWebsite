# Aimee Redmond Portfolio

A fresh portfolio built with React, Vite, TypeScript and plain SCSS.

## Highlights

- Mobile-first, responsive layout
- Accessible navigation, focus states, project dialog and reduced-motion support
- Persistent light and dark mode toggle
- Live GitHub project feed with a graceful offline fallback
- Built-in CMS at `/admin` for editing text, links, projects and images
- No Tailwind - styles live in `src/styles/main.scss`

## Run locally

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm run build
```

## Content and the CMS

All page content lives in `src/content/site.json`. You can edit it by hand, or use the editor at `/admin`.

In headings, wrap words in `*asterisks*` for the italic accent and use a new line for a line break.

### Local

1. Copy `.env.example` to `.env.local` and set `ADMIN_PASSWORD`.
2. Run `pnpm dev`, then open http://localhost:5173/admin/.

Saves write straight to `src/content/site.json` and `public/uploads/`, so you can review them with `git diff` before committing.

### Production (Netlify)

Saving in `/admin` commits the changes to `main` on GitHub, and Netlify then rebuilds the site (about a minute). Every edit is a normal commit, so it can be reviewed or reverted like any other.

Set these under Project configuration → Environment variables, scoped to **Production** only:

| Variable | Value |
| --- | --- |
| `ADMIN_PASSWORD` | The password for `/admin` |
| `SESSION_SECRET` | 32+ random characters, e.g. `openssl rand -hex 32` |
| `GITHUB_TOKEN` | Fine-grained token for this repository only, with **Contents: Read and write** |

The API lives in `netlify/functions/cms.ts`, with the shared logic in `server/`. Uploaded images are resized to at most 1600px and saved as WebP.
