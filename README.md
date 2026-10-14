# Office Premier Cricket League 2026

A working React + TypeScript tournament manager for the supplied four teams and 44 players. All team members are editable; every original player ID remains distinct.

## Run locally

Install Node.js 20.19+ (Node 22 LTS recommended), then from this directory:

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite (normally http://127.0.0.1:5173).

```sh
npm test
npm run build
npm run preview
```

Alternatively use pnpm with the included lockfile. The build produces `dist/`, ready for a static host. No server database or environment variables are needed. Deploy `dist/` to an HTTPS static host; there are no client-side URL routes requiring rewrites. The production build includes an offline service worker, which caches the app on its first successful visit. Offline reload works after that cache is installed. Development mode requires the local Vite server to remain running.

## Using the app

- **Teams & players:** choose Edit team or any player's pencil. Rename every player, select their role, choose a captain, add members, archive members, or restore archived members. IDs never change or merge. Keep at least two active players and an active captain on each team. Edits are saved with Save changes.
- **Fixtures:** all six supplied league pairings and the final are present. Set venue, date/time, and 4/6/8/10 overs before a match starts. Pairings remain fixed to preserve the specified round robin.
- **Live scorer:** choose the match, batting side, two openers, and innings length. Start innings, select the bowler, then record deliveries. Choose a different bowler each over. Wicket details let you select the dismissed batter, replacement, and fielder. Catches and stumpings require a fielder.
- **Appearance:** use the sun/moon button in the top bar to switch between light and dark themes. Your choice is remembered on this device. Each team has its own crest and branded background.
- **Quick extras:** Wide, No-ball, Bye, and Leg-bye each save one run immediately, with no submit step. Use Undo to correct a tap. For a multi-run extra or a no-ball with additional bat/byes runs, use **More extras / bat runs** to record that delivery once (do not tap the quick button first).
- **Extras:** wide values include the one-run penalty. No-balls have a one-run penalty plus bat runs or additional byes/leg-byes. Byes/leg-byes do not increase batter runs or bowler runs. A no-ball creates a free hit, retained through further wides/no-balls.
- **Corrections:** Undo removes the last event and recomputes the innings. Continue undoing to reach an earlier mistake, then re-enter deliveries. If you started the chase, undo its deliveries and empty setup first to correct the prior innings. Match reset requires confirmation.
- **Chases and ties:** innings end at the target, allocation, or all out. Start the chase with its two openers. Tied league matches award one point each unless a Super Over is played. Super Overs can be repeated; the final always offers one after a tie. A Super Over in progress temporarily makes that match incomplete. The winner then receives two points. Settings controls whether Super Overs are offered for league ties.
- **Standings:** points, NRR, then configured wins/head-to-head, then stable team ID. All-out innings use the full allocation for NRR. Super Overs and no-result matches are excluded from NRR. Finalists populate after all six league results; league results are locked once the final begins.
- **Statistics:** derived from saved regulation-innings deliveries, including in-progress matches. Super Overs are excluded. Rate tables have a configurable minimum-ball threshold. Player of the Tournament uses transparent impact points (runs + 20 × wickets + 10 × catches); Player of the Match can be selected manually.
- **Sharing:** JSON backup/import and standings CSV are in Settings; scorecard CSV, print, and copyable match summaries are in the match centre. JSON imports are validated before replacing saved data.

## Persistence and scope

Data is stored under `opcl-2026-v1` in this browser's local storage. Use **one scoring tab on one device** at a time. Export backups before clearing browser storage, changing domain/port, or moving to another device. There is no backend login, authorization system, or Firebase sync; admin controls are available to anyone using this browser. Hosting the app does not synchronize tournaments between users.

Lineups are captured when each innings starts. Archiving players does not remove them from an existing innings. Renaming updates the displayed name in historical scorecards while retaining the original ID. Roles are initially All-rounder and the first listed member is the initial editable captain; neither assignment was specified in the supplied roster.

Supported dismissals: bowled, caught, LBW, run out, stumped, hit wicket. No-ball/free-hit restrictions are applied. This office-cricket scorer does not model DLS/rain adjustments during an innings, penalty runs, retired/absent batters, obstructing the field, overthrows with boundary allowances, or crossing on an incomplete run-out run. Match allocations can be shortened **before** play; NRR then uses that allocation. Completed run-out runs are entered explicitly. Super Over eligibility restrictions between repeated rounds are administered by the scorer.

## Verification

27 automated tests cover legal balls, extras including no-ball leg-byes, strike rotation, bowler changes, wickets, free hits, undo, chase completion, all-out NRR, points, finalists, Super Overs, player statistics, backup validation, distinct player IDs, and persistence. TypeScript and the production build pass. Browser checks cover player name/role editing, reload persistence, innings setup, boundary/wide scoring, undo, and responsive layout. The delivered tournament contains no invented match results.

## Project structure

- `src/model.ts`: permanent player IDs, rosters, fixtures, event types.
- `src/engine.ts`: pure deterministic replay, results, standings, qualifications, stats.
- `src/storage.ts`: backup validation, persistence, CSV/download utilities.
- `src/App.tsx`: dashboard, editable rosters, scorer, scorecards, fixtures, settings.
- `src/components/ui/button.tsx`: shadcn-style Radix Slot / CVA button.
- `src/styles.css`: responsive dark sports theme with Tailwind CSS.
- `src/engine.test.ts`: scoring and persistence regression tests.
