# TODO

## V0.1 Preparation

- [x] Confirm V0.1 uses mock data only
- [x] Confirm V0.1 uses static Explain Why templates only
- [x] Define TypeScript types for Match, Bet, Bankroll, Selection, RiskLevel
- [x] Prepare 8-12 mock matches covering different match scenarios
- [x] Prepare mock bankroll and mock bet history
- [x] Implement calculation helpers before building pages

## V0.1 Step 1 - Project Setup

- [x] Create Next.js 15 project structure
- [x] Add TypeScript
- [x] Add TailwindCSS
- [ ] Add shadcn/ui
- [x] Add Recharts
- [x] Add base dark dashboard layout
- [x] Add simple navigation for Dashboard, Matches, Bankroll

## V0.1 Step 2 - Data And Logic

- [x] Add data/matches.json
- [x] Add data/bankroll.json
- [x] Add data/bets.json
- [x] Add types/match.ts
- [x] Add types/bet.ts
- [x] Add types/bankroll.ts
- [x] Add lib/elo.ts
- [x] Add lib/odds.ts
- [x] Add lib/value-edge.ts
- [x] Add lib/bankroll.ts
- [x] Calculate market implied probabilities from odds
- [x] Normalize market probabilities
- [x] Calculate Home / Draw / Away model probabilities from ELO
- [x] Calculate Value Edge for all selections
- [x] Calculate risk level
- [x] Calculate current bankroll, ROI, win rate, max drawdown, streaks

## V0.1 Step 3 - Pages

- [x] Add Dashboard page
- [x] Add Match list section
- [x] Add Value Opportunities section
- [x] Add Match Analysis detail page
- [x] Add Bankroll page
- [x] Add Review page
- [x] Add empty state for no value opportunities
- [x] Add static Explain Why card
- [x] Add suggested stake display
- [x] Add full Matches page
- [x] Add localStorage bet recording
- [x] Add pending bet settlement
- [x] Add bet editing
- [x] Add bet deletion
- [x] Add CSV export
- [x] Add best/worst bet review
- [x] Add selection-level review summary

## V0.1 Step 4 - Charts

- [x] Add probability comparison chart
- [x] Add value edge chart
- [x] Add bankroll history chart
- [x] Add simple result summary metrics

## V0.1.5 - Score Prediction

- [x] Add expected goals calculation
- [x] Add Top 5 scoreline prediction
- [x] Add goal margin probabilities
- [x] Add over/under 2.5 goal probabilities
- [x] Add score prediction card to match detail page
- [x] Add beginner explanation for score prediction

## V0.1.6 - Bet Record Types

- [x] Add result / margin / score prediction types
- [x] Allow bankroll page to record goal margin predictions
- [x] Allow bankroll page to record exact score predictions
- [x] Allow manual odds input for margin and score predictions
- [x] Add value edge hints for result / margin / score records
- [x] Store model probability, market probability, and value edge on records
- [x] Export prediction type and prediction label in CSV
- [x] Review performance by prediction type

## V0.1.7 - Data Source Preparation

- [x] Add app config for app version, model version, and data sources
- [x] Store odds source on new bet records
- [x] Store model version on new bet records
- [x] Export odds source and model version in CSV
- [x] Add Settings / Data Source page
- [x] Document current mock/manual/API status

## V0.2 - Match And Score API

- [x] Add Football Data API route for competition matches
- [x] Add API key environment example
- [x] Map API matches into local Match type
- [x] Save synced API matches to localStorage
- [x] Add Settings sync panel
- [x] Let Dashboard use synced matches when available
- [x] Let Matches page use synced matches when available
- [x] Let Bankroll page record synced matches
- [x] Let Review page resolve synced match names
- [x] Keep mock data fallback when API key is missing

## V0.2.1 - Sync Status UX

- [x] Store syncedAt metadata with API matches
- [x] Show last sync time on Settings
- [x] Show last sync time on Dashboard and Matches
- [x] Show Football Data API key status
- [x] Show synced match count and source

## V0.3.1 - Odds API Research

- [x] Research The Odds API
- [x] Research API-Football
- [x] Research Sportmonks at a high level
- [x] Choose The Odds API as first V0.3 provider
- [x] Keep API-Football as backup for football-specific markets
- [x] Document V0.3 implementation plan

## V0.3.2 - Odds Data Structure

- [x] Add Odds provider, market, outcome, and stored odds types
- [x] Add localStorage helper for future API odds sync
- [x] Add The Odds API environment variable placeholders
- [x] Add Odds API config status fields
- [x] Show Odds API preparation status on Settings page
- [x] Bump app/model version to V0.3.2

## V0.3.3 - The Odds API Connection

- [x] Add API route for odds sync
- [x] Check configured sport key before syncing odds
- [x] Map The Odds API response into local Odds type
- [x] Save synced odds to localStorage
- [x] Add settings button for odds sync
- [x] Confirm World Cup sport key with a real The Odds API key

## V0.3.4 - Use API Odds In Pages

- [x] Show synced odds on Match detail page
- [x] Let Bankroll page prefer API odds when available
- [x] Keep manual odds fallback for score and unavailable markets
- [x] Record API odds source on new bet records

## V0.3.5 - Use API Odds In Discovery

- [x] Recalculate Dashboard value edges with synced API result odds
- [x] Recalculate Matches page value edges with synced API result odds
- [x] Show current odds source on Dashboard and Matches page
- [x] Show odds source on match cards
- [x] Keep mock odds fallback when API odds cannot match a game

## V0.4.0 - AI Match Analysis

- [x] Add OpenAI environment variable placeholders
- [x] Add OpenAI key/model status to config API
- [x] Add AI match analysis API route
- [x] Add AI analysis panel to match detail pages
- [x] Add AI configuration panel to Settings page
- [x] Keep page usable when OpenAI key is missing
- [x] Switch AI analysis route to DeepSeek-compatible Chat Completions
- [x] Support AI_PROVIDER / AI_API_KEY / AI_BASE_URL / AI_MODEL
- [x] Keep legacy OPENAI_* variables as fallback
- [ ] Test with a real DeepSeek API key from the browser

## V0.4.1 - AI Analysis UX

- [x] Cache generated AI analysis in browser localStorage
- [x] Restore cached AI analysis on match detail page
- [x] Add copy AI analysis button
- [x] Add clear cached AI analysis button
- [x] Add link to carry AI summary into Bankroll notes
- [x] Let Bankroll page prefill match and notes from URL parameters

## V0.5.0 - Data Safety And Market Coverage

- [x] Add full local data export from Settings
- [x] Add local data import and restore from Settings
- [x] Add odds matching inspection panel
- [x] Show matched/unmatched game counts for API odds
- [x] Add totals value-edge calculation from score model
- [x] Add spreads value-edge calculation from score model
- [x] Add market value panel to match detail pages
- [x] Add review by odds source
- [x] Add review by positive/negative value edge

## V0.1 Step 5 - Verification

- [x] Verify all mock matches render
- [x] Verify value opportunities are sorted by Value Edge descending
- [x] Verify only positive-edge selections appear in Value Opportunities
- [x] Verify bankroll metrics match mock bet history
- [x] Run lint/build if available
- [x] Note known issues before moving to V0.2

## Out Of Scope For V0.1

- No Football Data API integration
- No Odds API integration
- No OpenAI API integration
- No database
- No user login
- No payment
- No auto-betting
