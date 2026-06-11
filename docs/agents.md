# AGENTS.md

## Project Rules

This is a personal World Cup Value Betting Dashboard.

Do not implement:
- real-money payment
- gambling platform integration
- auto-betting
- user login
- public sharing

Use mock data first. Do not connect external APIs in V0.1 unless requested.

## Tech Stack

Use:
- Next.js 15
- TypeScript
- TailwindCSS
- shadcn/ui
- Recharts
- localStorage

## Core Logic

Use:
- ELO rating
- odds implied probability
- value edge
- static template explanation in V0.1
- GPT explanation only from V0.4 onward

Value Edge = Model Probability - Market Probability

For V0.1:
- calculate Home / Draw / Away probabilities for every match
- calculate Value Edge for all three selections
- show only positive-edge selections in Value Opportunities
- use mock riskFactors instead of live injury/news analysis

## Bankroll

Initial bankroll: 500 RMB.

Entertainment mode:
- bankroll can go to 0
- no forced stop-loss at 300
- track ROI, win rate, max drawdown, winning streak, losing streak

## Development Rules

Before coding:
- inspect project structure
- make a short plan

After coding:
- run lint/build if available
- summarize changed files
- mention known issues
