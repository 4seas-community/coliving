import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

const root = join(import.meta.dirname, "..")
const source = readFileSync(join(root, "components/site-chrome.tsx"), "utf8")

test("site-chrome's ASSET_BASE points at files nginx actually proxies to this app", () => {
  // This app has no Next basePath and is reverse-proxied at /coliving by
  // nginx, which only forwards a specific allowlist of root paths (see
  // deploy/DEPLOY.md). An asset base outside that allowlist (e.g. a bare
  // "/site-chrome") 404s in production even though it works in local dev,
  // because local dev has no nginx in front of it.
  const match = source.match(/const ASSET_BASE = '([^']+)'/)
  assert.ok(match, "expected to find an ASSET_BASE constant")
  const assetBase = match[1]
  assert.ok(
    assetBase.startsWith("/coliving/"),
    `ASSET_BASE (${assetBase}) must live under /coliving/, the one prefix nginx always forwards here`
  )
})

test("every asset referenced from ASSET_BASE exists on disk at the path it will be served from", () => {
  const match = source.match(/const ASSET_BASE = '([^']+)'/)
  const assetBase = match[1]
  const filenames = [...source.matchAll(/\$\{ASSET_BASE\}\/([\w.-]+)/g)].map((m) => m[1])
  assert.ok(filenames.length > 0, "expected to find at least one ${ASSET_BASE}/... reference")

  // A public/ file is served at the same path it sits under public/.
  const publicRelativeDir = assetBase.replace(/^\//, "")
  for (const filename of filenames) {
    const onDisk = join(root, "public", publicRelativeDir, filename)
    assert.ok(existsSync(onDisk), `expected ${onDisk} to exist (served at ${assetBase}/${filename})`)
  }
})
