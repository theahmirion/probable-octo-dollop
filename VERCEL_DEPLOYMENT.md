# Deploying Moonfall Fiction to Vercel

This application is fully configured and ready for seamless one-click deployment to [Vercel](https://vercel.com).

## Architecture on Vercel

- **Frontend:** Built via `vite build` into static assets in `dist/`. Vercel automatically serves these with high-speed CDN caching and Single Page Application (SPA) routing fallback.
- **Backend APIs:** Exported as a Node.js Serverless Function at `api/index.ts` via Express. Vercel automatically routes `/api/*` requests directly to this serverless handler.
- **Persistence & Resilience:** In serverless environments, database reading gracefully falls back to bundled repository data and writes updates to `/tmp` and memory without throwing read-only filesystem errors.
- **Static Assets:** Cover artwork and imagery are mirrored in `public/assets/images/` and `public/src/assets/images/`, ensuring all images render in production builds.

---

## Deployment Steps

### Option A: Via GitHub & Vercel Web Dashboard (Recommended)

1. **Push this repository** to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new) and log in.
3. Import your Moonfall repository.
4. **Vercel will auto-detect the configuration from `vercel.json`:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. *(Optional)* Add any Environment Variables:
   - `AUTHOR_SECRET`: *(Optional)* Your custom author master passphrase (default: `gloomywriter2026`).
   - `GEMINI_API_KEY`: *(Optional)* If using Gemini integrations.
6. Click **Deploy**.

---

### Option B: Via Vercel CLI

1. Install the Vercel CLI if you haven't already:
   ```bash
   npm i -g vercel
   ```
2. Run the deployment command from the project root:
   ```bash
   vercel
   ```
3. To deploy to production:
   ```bash
   vercel --prod
   ```

---

## Configuration Files Added

- **`vercel.json`**: Configures the build command (`npm run build`), output directory (`dist`), and request rewrites (`/api/(.*)` $\rightarrow$ `/api/index.ts`, `/*` $\rightarrow$ `/index.html`).
- **`api/index.ts`**: The serverless function entry point exporting the Express application.
- **`src/server/app.ts`**: Modular Express app supporting both standalone dev server (`tsx server.ts`) and serverless execution on Vercel.
- **`.vercelignore`**: Excludes `node_modules`, test caches, and transient files from being uploaded during deployment.
