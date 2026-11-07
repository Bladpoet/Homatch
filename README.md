# Homatch

Swipe-to-match for renting. Tenants swipe on homes and landlords swipe on tenants: first the ones who liked their place, then a discovery pool of renters who fit. When both sides say yes, they can chat.

Built in a day at the Devin × give(a)go event by Jazz, Kamsi, and Coleman.

- **Agents and humans, start here:** [`AGENTS.md`](AGENTS.md)
- What we're building: [`docs/PRODUCT.md`](docs/PRODUCT.md)
- Data shapes and API: [`docs/CONTRACTS.md`](docs/CONTRACTS.md)
- Where we are and who does what: [`docs/tasks/`](docs/tasks/README.md) (team board, plus one file each for [Coleman](docs/tasks/coleman.md), [Jazz](docs/tasks/jazz.md), and [Kamsi](docs/tasks/kamsi.md))

> Demo project. All data is seeded and fake. Supabase row-level security is intentionally off.

## Run it
```bash
npm install
npm run dev
```
Open http://localhost:3000/demo in two tabs. Pick Maya in one and David in the other.
