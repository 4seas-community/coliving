import test from "node:test"
import assert from "node:assert/strict"
import Module from "node:module"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import ts from "typescript"

function load(relativePath) {
  const filename = join(import.meta.dirname, "..", relativePath)
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  })
  const mod = new Module(filename)
  mod.filename = filename
  mod.paths = Module._nodeModulePaths(dirname(filename))
  mod._compile(outputText, filename)
  return mod.exports
}

const { languageFromPathname } = load("lib/site-not-found-language.ts")

test("the 404 page picks language from the first path segment only", () => {
  assert.equal(languageFromPathname("/zh-CN/coliving"), "zh")
  assert.equal(languageFromPathname("/th/apply"), "th")
  // A path with "th"/"zh" as a LATER segment must not be misread as that language.
  assert.equal(languageFromPathname("/coliving/th/missing"), "en")
  assert.equal(languageFromPathname("/apply/zh"), "en")
  assert.equal(languageFromPathname("/some-unknown-path"), "en")
})
