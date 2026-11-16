#!/usr/bin/env node
// Scope check: every file the branch changed must be declared in the change's proposal.
// An agent that quietly edits code outside the approved spec fails here before review.
//
// Usage: node scripts/scope-check.mjs [change-id] [--base <ref>]
//   change-id  defaults to the branch name without the "change/" prefix
//   --base     defaults to the merge base with sandbox/agent-pipeline (or main)
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()

const args = process.argv.slice(2)
const baseFlag = args.indexOf('--base')
const baseRef = baseFlag >= 0 ? args[baseFlag + 1] : undefined
const positional = args.filter((arg, i) => !arg.startsWith('--') && args[i - 1] !== '--base')

const branch = git('rev-parse', '--abbrev-ref', 'HEAD')
const changeId = positional[0] ?? branch.replace(/^change\//, '')
const proposalPath = path.join('openspec', 'changes', changeId, 'proposal.md')

if (!existsSync(proposalPath)) {
  console.log(`scope-check: no open change "${changeId}" on branch ${branch} — nothing to check.`)
  process.exit(0)
}

// Declared scope: backticked paths/globs inside the "## Impact" section.
const proposal = readFileSync(proposalPath, 'utf8')
const impact = proposal.split(/^## Impact\s*$/m)[1]?.split(/^## /m)[0] ?? ''
const declared = [...impact.matchAll(/`([^`\s]+\/[^`\s]*)`/g)].map((match) => match[1])
declared.push(`openspec/changes/${changeId}/**`)

const toRegExp = (glob) =>
  new RegExp(
    '^' +
      glob
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*\/?/g, '\u0000')
        .replace(/\*/g, '[^/]*')
        .replace(/\u0000/g, '.*') +
      '$',
  )
const patterns = declared.map((glob) => ({ glob, re: toRegExp(glob) }))

const findBase = () => {
  for (const ref of ['sandbox/agent-pipeline', 'main']) {
    try {
      return git('merge-base', 'HEAD', ref)
    } catch {}
  }
  throw new Error('scope-check: cannot find a base ref, pass --base <ref>')
}
const base = baseRef ?? findBase()

const changed = new Set(
  [
    git('diff', '--name-only', `${base}...HEAD`),
    git('diff', '--name-only'),
    git('diff', '--name-only', '--cached'),
    git('ls-files', '--others', '--exclude-standard'),
  ]
    .join('\n')
    .split('\n')
    .filter(Boolean),
)

const outside = [...changed].filter((file) => !patterns.some(({ re }) => re.test(file)))

console.log(`scope-check: change "${changeId}", ${changed.size} changed file(s), ${declared.length} declared path(s)`)
for (const file of [...changed].sort()) {
  console.log(`  ${outside.includes(file) ? '✗ OUT OF SCOPE' : '✓'}  ${file}`)
}

if (outside.length > 0) {
  console.error(
    `\nscope-check FAILED: ${outside.length} file(s) are not declared in ${proposalPath} → ## Impact.\n` +
      'Either revert them or stop and propose a plan update to the owner.',
  )
  process.exit(1)
}
console.log('\nscope-check passed: every change is inside the declared scope.')
