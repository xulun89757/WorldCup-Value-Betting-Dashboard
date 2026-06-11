# Deployment Checklist

Last updated: 2026-06-11

## Deployment Target

- Recommended host: Vercel
- Recommended usage: private or single-user deployment
- Public multi-user deployment requires authentication, rate limiting, and persistent storage before launch.

## Required Environment Variables

Set these in Vercel Project Settings > Environment Variables.

```bash
FOOTBALL_DATA_API_KEY=
FOOTBALL_DATA_COMPETITION=WC

THE_ODDS_API_KEY=
THE_ODDS_API_SPORT=soccer_fifa_world_cup
THE_ODDS_API_REGIONS=eu
THE_ODDS_API_MARKETS=h2h,totals,spreads
THE_ODDS_API_BOOKMAKER=

AI_PROVIDER=deepseek
AI_API_KEY=
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-v4-flash
```

Do not deploy `.env.local`. It is for local development only.

## Pre-Deploy Checks

- [ ] Confirm `.env.local` is ignored by git and never uploaded.
- [ ] Confirm `.env.example` contains placeholders only.
- [ ] Run `npm ci`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Confirm Vercel has all required environment variables.
- [ ] Confirm deployment is private or protected if API credits are valuable.

## Post-Deploy Smoke Test

- [ ] Open `/settings` and confirm API Key status shows configured.
- [ ] Sync Football Data matches.
- [ ] Sync The Odds API odds.
- [ ] Open a match detail page and confirm kickoff time, odds, value edge, score prediction, and goal-difference markets show correctly.
- [ ] Run AI match analysis on one match.
- [ ] Add one bankroll record.
- [ ] Open `/review` and confirm the record appears.
- [ ] Export a backup from settings.

## Before Public Launch

- [ ] Add login or deployment-level access protection.
- [ ] Add API rate limiting.
- [ ] Add server-side validation for AI analysis requests.
- [ ] Add persistent database storage if data must survive browser/device changes.
- [ ] Add monitoring for API failures and AI cost spikes.
