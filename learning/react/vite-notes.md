# Vite notes

- Vite dev server starts fast and serves the src files directly.
- The html entry lives at the project root and loads /src/main.jsx.
- Config lives in vite.config.js at the root.
- npm run build bundles the app into dist/ for production.
- A server.proxy block forwards /api and /uploads to the api during dev.
- Env vars live in .env files and are read from import.meta.env.
