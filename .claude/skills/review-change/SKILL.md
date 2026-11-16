---
name: review-change
description: Skeptical review of a change in this repo before the owner looks at it. Compares the diff with its OpenSpec change (scope, scenarios, tasks), checks the AGENTS.md code rules, runs the checks, and reports evidence-backed findings with a verdict. Read-only unless asked to fix. Use when the user asks to review a change, a branch or the current diff ("review", "ревью", "проверь изменения").
---

# Review a change

You review, you do not implement. Treat the change as wrong until the diff and the check output show
otherwise. Every finding cites evidence (`path:line`, a scenario, command output); "looks good" is only
allowed after the checks have actually run.

## 1. Pin the target

- Change id: the branch name without `change/`, or the id / branch / base ref the user names.
- Base: `git merge-base HEAD main`. Diff: `git diff <base>...HEAD` plus uncommitted work
  (`git diff`, `git diff --cached`).
- If `openspec/changes/<id>/` exists, read `proposal.md`, `design.md`, `tasks.md` and every
  `specs/**/spec.md`. Without a change, review against the user's request and `AGENTS.md`, and say so in
  the report.
- Read each changed file in full, not only the hunks: bugs hide next to the change.

## 2. Run the checks

| When | Command |
| --- | --- |
| Always | `pnpm check` (web typecheck, lint, unit tests, scope check) |
| `apps/api/**` changed | `pnpm --filter api typecheck && pnpm --filter api lint && pnpm --filter api test` |
| UI or a user flow changed | `pnpm --filter web e2e:local` (starts anvil, the API and Next by itself) |
| RPC or Blockscout behaviour changed | `pnpm e2e` — a failing `@network` test first names the failing endpoint before blaming the code |

Record every command with its result. A red check is a blocker. If a check cannot run (no Chrome, RPC
down), write that down instead of skipping it silently.

## 3. Review passes

**A. Spec conformance** (when an OpenSpec change exists)
- Every `#### Scenario` in the delta specs has code that implements it and a test that would fail
  without it.
- Every checked item in `tasks.md` is really in the diff; unchecked items are findings.
- The diff does what the proposal says and nothing more. The scope check covers files; you cover
  behaviour: drive-by refactors, unrelated changes.

**B. Correctness in this app**
- Amounts: `bigint` end to end, per-token decimals, no float math, truncation rather than rounding
  (`apps/web/src/lib/format.ts`).
- Addresses: `isAddress` on input, `isAddressEqual` for comparisons, checksummed output.
- Chains: `chainId` passed explicitly, testnets only, the unsupported-network state handled.
- Async UI: loading, error and empty states; stale data after a chain or account switch; double submit.
- Wallet and RPC errors: a rejection is not a failure, an RPC outage is not a contract failure
  (`apps/web/src/lib/errors.ts`).
- SIWE and the API: single-use nonce, domain binding, 401/403 paths, cookie flags, input validation.

**C. Code rules** (`AGENTS.md`): strict TypeScript, no `any` or unexplained casts; pure logic in
`apps/web/src/lib/*.ts` with a test next to it; thin components; comments say why; no new dependency
without a note in `design.md`; no mainnet chains, private keys or real RPC keys; lockfile not edited by
hand.

**D. Tests**: new logic has unit tests that assert behaviour, not implementation; changed user flows are
covered by e2e; no `.only` or skipped tests.

**E. Security**: secrets in code or `.env.example`; untrusted data (NFT metadata, RPC responses, API
errors) rendered as text; external links with `rel="noreferrer"`.

## 4. Findings

| Severity | Meaning |
| --- | --- |
| blocker | Wrong behaviour, a red check, a security issue, or a spec scenario not met |
| major | A likely bug, or changed behaviour without a test |
| minor | A rule broken without changing behaviour |
| nit | Optional |

Each finding: id (`R1`, `R2`, …), severity, `path:line`, what is wrong, the evidence, and the fix in one or
two sentences. Anything you cannot back with evidence goes under Questions, not Findings.

## 5. Report and verdict

Save the report to `openspec/changes/<id>/review.md` when the change exists (it is archived with the
change), otherwise answer in chat:

```markdown
# Review: <id> (<base short sha>..<head short sha>)

Verdict: approve | changes requested

## Checks
| Command | Result |

## Findings
### R1 · major · `apps/web/src/components/SendForm.tsx:42`
What is wrong. Evidence. Suggested fix.

## Spec coverage
| Scenario | Code | Test |

## Questions
```

The verdict is "changes requested" if there is any blocker or major finding, "approve" otherwise (minor
findings and nits stay listed). The verdict is advice: the owner merges.

## 6. Re-review

On a repeat run keep the finding ids and mark each one fixed (cite the commit or line), still open, or
withdrawn (say why); new findings get new ids. Re-read the fixes and their surroundings, and run the
checks in full again.

## Boundaries

Read-only by default: no edits, commits or pushes. Fix findings only when the owner asks, then review
again.
