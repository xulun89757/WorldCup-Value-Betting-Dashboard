# Release Notes

## v0.5.0 Production Candidate

Release date: 2026-06-11

### Highlights

- Chinese beginner-friendly dashboard experience.
- Match list, match detail, kickoff time display, prediction, score prediction, and goal-difference support.
- Value edge analysis for win/draw/loss, score, total goals, and goal-difference related markets.
- Bankroll tracking with stake, odds, market type, notes, and review workflow.
- Review page for bet results, bankroll impact, and value quality.
- Football Data API match sync.
- The Odds API odds sync for h2h, totals, and spreads.
- DeepSeek-compatible AI match analysis.
- Settings page with API status, data sync, odds matching, backup export, and backup import.
- Operation manual page for beginner usage.

### Production Preparation

- Added deployment checklist.
- Added Vercel deployment configuration.
- Added production audit report.
- Added environment variable example file.
- Reduced AI configuration exposure in the status endpoint.

### Known Limitations

- User data is stored in the browser, not in a server database.
- API routes are not authenticated yet.
- No API rate limiting yet.
- Mobile layout is responsive, but the project is optimized mainly for desktop use.
- Odds matching depends on provider names and market availability, so manual review is still required.
- AI analysis is advisory only and can be wrong.

### Upgrade Notes

- Keep real keys in `.env.local` locally and in Vercel environment variables for production.
- Use `AI_PROVIDER=deepseek`, `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL` for DeepSeek-compatible analysis.
- Export a backup before clearing browser data or switching browsers.
