# Agent workflow

Rules for coding agents (Claude Code) working in this repository. The human owner approves plans
and reviews every change; the agent implements and verifies.

## Pipeline: one change = one spec = one worktree = one branch

1. **Spec first.** Every task starts as an OpenSpec change: `openspec/changes/<change-id>/` with
   `proposal.md` (why and what), `design.md` (how), `tasks.md` (the plan) and delta specs.
   Use `/opsx:propose`. No code before the spec exists.
2. **Own worktree.** Implement each change in its own git worktree and branch, never in the main
   checkout:
   ```bash
   git worktree add ../web3-dapp-demo-worktrees/<change-id> -b change/<change-id>
   ```
   Several changes can run in parallel because they never share a working directory.
3. **Plan approval.** Stop after writing `tasks.md` and wait for the owner's approval.
   Implementation starts only after an explicit "approved".
4. **The plan is not changed silently.** If the approved plan turns out to be wrong, stop, explain
   why and propose the updated `tasks.md`. Continue only after the owner approves the new plan.
5. **Scope is declared.** The `## Impact` section of `proposal.md` lists every file or glob the
   change may touch, as backticked paths. Touching anything else needs a plan update first.
6. **Checks after every task group.** Run `pnpm check` (typecheck, lint, unit tests, scope check).
   Fix failures yourself until the checks are green. If the same failure survives three attempts,
   stop and ask the owner instead of working around it.
7. **Review and archive.** The owner reviews the diff. After merge, archive the change with
   `/opsx:archive` so its specs move into `openspec/specs/`.

## Code rules

- TypeScript strict, no `any`. Match the style of the surrounding code; comments explain *why*.
- Pure logic goes to `apps/web/src/lib/*.ts` with a unit test next to it (`*.test.ts`, Vitest).
- Components stay thin: they wire hooks to `lib` functions and render.
- Testnets only. Never add mainnet chains, private keys or real RPC keys to the code.
- Do not edit `pnpm-lock.yaml` by hand; do not add dependencies without saying so in `design.md`.
