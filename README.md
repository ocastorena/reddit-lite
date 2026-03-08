# Reddit Lite

[![CI](https://github.com/ocastorena/reddit-lite/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ocastorena/reddit-lite/actions/workflows/ci.yml)
[![CD](https://github.com/ocastorena/reddit-lite/actions/workflows/cd.yml/badge.svg?branch=main)](https://github.com/ocastorena/reddit-lite/actions/workflows/cd.yml)

A lightweight Reddit client built with React. Browse popular subreddits, read posts, and view comments — all in a clean, dark-themed interface.

**[Live Demo](https://ocastorena.github.io/reddit-lite/)**

![Reddit Lite screenshot](docs/screenshot.png)

## Features

- Browse popular subreddits and their posts
- View subreddit details including banner, stats, and content types
- Read and expand comments inline with a scrollable panel
- Search/filter posts by keyword
- Upvote and downvote posts
- Responsive layout with a mobile-friendly dropdown menu
- API response caching to reduce Reddit rate limits

## Tech Stack

- **React** — UI components
- **Redux Toolkit** — State management
- **Tailwind CSS** — Styling
- **Vite** — Build tool and dev server
- **Vitest** — Unit testing
- **Cloudflare Workers** — CORS proxy for the Reddit API

## Getting Started

```sh
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |
| `npm test`        | Run unit tests           |
