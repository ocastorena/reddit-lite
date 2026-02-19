# Reddit Lite

Reddit Lite is a small React + Redux app that lets users browse posts, open comments, and use a responsive Reddit-style UI.

## Tech Stack

- React
- Redux Toolkit
- Tailwind CSS
- Vite

## Local Development

```sh
npm ci
npm run dev
```

Open `http://localhost:5173`.

## Scripts

- `npm run dev` - Start local dev server
- `npm run lint` - Run ESLint
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally

## CI/CD

This repo includes two GitHub Actions workflows:

- `/.github/workflows/ci.yml`
  - Runs on pull requests and pushes to `main`
  - Executes `npm ci`, `npm run lint`, and `npm run build`
- `/.github/workflows/cd.yml`
  - Runs after `CI` succeeds on `main` (or manually via workflow dispatch)
  - Builds and deploys `dist/` to GitHub Pages
  - Automatically sets the correct Vite `base` path for project pages

## Live Demo (GitHub Pages)

1. In GitHub, go to `Settings > Pages`.
2. Under `Build and deployment`, set `Source` to `GitHub Actions`.
3. Push to `main` (or run the `CD` workflow manually).

For this repository, the live URL is expected to be:

- `https://ocastorena.github.io/reddit-lite/`

If this project is forked, use:

- `https://<your-github-username>.github.io/reddit-lite/`
