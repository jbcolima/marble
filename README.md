# Ball (Three.js + Vite + Electron)

A small Three.js scene ( ball over grass) built with Vite, with optional Electron desktop packaging and Vercel deployment.

## Requirements
- Node.js 18+
- npm 10+

## Install
```bash
npm ci
```

## Development (web)
```bash
npm run dev
```
Open `http://localhost:5173`.

## Development (Electron)
Starts Vite and Electron together.
```bash
npm run electron:dev
```

## Production build (web)
```bash
npm run build
```
Build output is in `dist/`.

## Production run (Electron)
Build the web assets and run the Electron app loading `dist/index.html`:
```bash
npm run build
npm run electron:build
```

## Deploy to Vercel
- The project includes `vercel.json`.
- Use these settings if configuring in the dashboard:
  - Install command: `npm ci`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Framework preset: Vite

## Assets
- Public assets live under `static/` and are published at runtime to `/textures/...` in production (Vite `publicDir: 'static'`).
- In Electron and production builds, textures are loaded using relative paths like `textures/marble/marble_0003_color_1k.jpg` and end up in `dist/textures/...`.

## Project structure
```
marble/
  index.html              # Vite HTML entry (used in dev and build)
  vite.config.js          # Vite config (base: './', publicDir: 'static')
  vercel.json             # Vercel build/output config (optional)
  src/
    main.js               # Three.js renderer app (loaded by index.html)
  static/
    textures/             # Public assets copied to dist/ at build
  electron/
    electron.js           # Electron main process (creates BrowserWindow)
```

## Scripts
- `dev`: Vite dev server
- `build`: Vite production build to `dist/`
- `preview`: Preview the production build locally
- `electron:dev`: Run Vite and Electron together in dev
- `electron:build`: Build web assets then run Electron pointing at `dist/`

## Common issues
- Textures 404 on Vercel:
  - Ensure Vercel is using `npm run build` and serving `dist`
  - Confirm `dist/textures/...` exists after `npm run build`
- Electron window doesn’t open:
  - Check terminal logs for lines starting with `[electron] ...`
  - Ensure the dev server is on `http://localhost:5173` (or adjust `electron:dev` script)
- Two index.html files:
  - Keep only the root `index.html`. Remove `src/index.html` if present.

## Clean and share
Safe to delete (rebuildable):
- `node_modules/` (reinstall with `npm ci`)
- `dist/` (regenerate with `npm run build`)
- `.vite/`, `.vercel/` (if present)
- `static/textures/marble/__MACOSX`

Recommended `.gitignore`:
```
node_modules/
dist/
.vite/
.vercel/
.DS_Store
```

## License
MIT
