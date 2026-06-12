# Soccer Manager

A comprehensive soccer team management app — manage teams, players, matches, track stats, and view live standings.

## Features

- **Dashboard** — overview with recent matches, top scorers, and standings summary
- **Teams** — full CRUD: add, edit, delete teams with name, colors, stadium
- **Players** — full CRUD: add, edit, delete players with position, number, nationality
- **Matches** — schedule matches and record results with goal/event tracking
- **Standings** — auto-calculated league table (points, GD, form)
- **Stats** — leaderboards for top scorers, assists, appearances, clean sheets, cards

## Tech

- Vanilla JS frontend (no framework)
- Vercel serverless functions (API)
- Upstash Redis (storage)

## Deployment

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new)

After deploying, create a Redis database in your Vercel dashboard (Storage → Create Database → Redis) and link it to your project.

## Local dev

```bash
npm install
npx vercel dev
```

## License

MIT © Thando Hlomuka
