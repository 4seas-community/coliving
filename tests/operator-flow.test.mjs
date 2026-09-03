import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")

test("GitHub is the only documented source of truth", async () => {
  const [readme, agents] = await Promise.all([read("README.md"), read("AGENTS.md")])
  assert.match(readme, /only source of truth/i)
  assert.match(agents, /only development source of truth/i)
  assert.match(readme, /github\.com\/4seas-community\/coliving/)
})

test("Gitea synchronization is fast-forward-only", async () => {
  const script = await read("scripts/sync-gitea.sh")
  assert.match(script, /merge-base --is-ancestor/)
  assert.doesNotMatch(script, /push[^\n]*(--force|-f\b)/)
  assert.match(script, /Production was not changed/)
})

test("GitHub main CI has no production deployment step", async () => {
  const workflow = await read(".github/workflows/ci.yml")
  assert.match(workflow, /contents: read/)
  assert.doesNotMatch(workflow, /ssh|scp|rsync|release-244|systemctl/i)
})
