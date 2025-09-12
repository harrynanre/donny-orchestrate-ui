# CLAUDE.md — Donny V5 Global Rules (Status-Lens First)

> Use these global rules whenever you work inside this repository. Your goal is to make Donny V5 easy, reliable, and transparent by wiring features one-by-one while the UI shows **RED / ORANGE / GREEN / GREY** status.

---

## Mission
- Build and wire **Donny V5** around the *Wiring Status Dashboard* ("status lens") as the primary UX.
- Keep the **same page tree** as the pretty dashboard, but each page/tile must reflect live backend status via a manifest.
- Move features **from RED → GREEN** systematically. Don't ship hidden mocks.

## Environment & Ports
- UI: **:5000** (Next.js 15 App Router)
- API: **:5055**
- Doctor: **:5056**
- These are fixed; do **not** change without explicit approval.

## Autonomy & Permissions (important)
- Work autonomously **without asking for permission** for normal, non-destructive actions (reading, listing, editing, creating files, running builds/tests, git operations, docker compose, etc.).
- **Always ask for explicit confirmation before any delete/destructive action**, including:
  - `rm` / deletion of files or directories
  - destructive git (e.g., `git reset --hard`, `git clean -xfd`, force pushes)
  - dropping databases, clearing buckets, wiping volumes
- Never enable "dangerously skip permissions" outside a dev container / sandbox explicitly created for that task.

## Coding Standards
- Keep the UI **pure Next.js 15** + TypeScript + Tailwind + shadcn/ui. No Vite remnants.
- Strict TypeScript. Small, composable components. KISS / YAGNI.
- Keep `/health` and `/api/wiring/manifest` working at all times.
- Follow the **Wiring Manifest** contract from `Donny_Wiring_Status_Dashboard_Spec_v1.md` (env, features, checks, statuses).

## Status Rules (how tiles turn colors)
- **GREEN**: All required checks pass (reachability + schema + auth if needed; p95 under SLO).
- **ORANGE**: Required pass but optional fail or SLO breached.
- **RED**: Any required check fails (5xx / timeout / invalid schema / auth fail).
- **GREY**: Feature intentionally disabled or not configured for this env.

## Delivery Workflow
1) Propose a tiny plan → implement → verify → PR.
2) On each PR, include a brief **Wiring Readiness** note:
   - endpoint URLs checked, status codes, ~latencies
   - what changed and why
3) Keep PRs surgical; prefer 1 feature/tile at a time.

## Tools & Integrations (use when helpful)
- **MCP**: Prefer Serena (semantic code search/edit) and Archon (knowledge/tasks). Use them to understand and modify large codebases reliably.
- **GitHub CLI**: Create issues/PRs, link work to issues, and post summaries.
- **Hooks**: Add lightweight hooks to log tool usage or gate validation steps (no secrets).
- **Sub-agents**: Use specialized agents for validation gates, docs updates, or schema diffs.

## Testing & Verification
- Health checks must return `{ ok: true, ... }` with version + timestamp.
- For each newly wired feature, add a minimal probe endpoint and surface the result in the manifest.
- Include curl outputs in PR descriptions. Keep Kuma/n8n monitors aligned (paused until explicitly enabled).

## Communication
- Be concise and explicit. When something is RED/ORANGE, state **exactly** which check failed and why.
- Never hide degraded states behind mock data.

---

### Quick Checklist Before You Commit
- [ ] UI builds & `/health` is 200 at `:5000`.
- [ ] Manifest returns valid JSON at `/api/wiring/manifest`.
- [ ] Any new feature exposes a health/probe endpoint and appears in the manifest.
- [ ] No deletes performed without explicit approval.
- [ ] PR body includes Wiring Readiness notes (URLs, codes, latency).

### Page Scope (reference)
Chat, Agents, Tasks, Analytics, Scan-&-Fix, Products, Marketing, Settings, Metrics, Events, Army, Marketplace, Memory, Documents, Doctor, Vault (if present).