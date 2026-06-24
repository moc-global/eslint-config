## 1. Manifest — the linchpin

- [x] 1.1 In `package.json`: set `name` to `eslint-config-mocg` (unscoped), `version` to `2.2.0`, and rename the `bin` key `moc-eslint` → `eslint-config-mocg` (value `./dist/cli/index.js` unchanged). Leave `repository`/`homepage`/`bugs` URLs and `publishConfig.access` as-is.
- [x] 1.2 Regenerate `package-lock.json` by running `npm install` (updates the root `name`, `version`, and the `bin` entry). Do not hand-edit the lockfile.

## 2. Public API rebrand (moc → mocg)

- [x] 2.1 In `src/index.ts`: rename `export interface MocOptions` → `MocgOptions`, `export async function moc(` → `mocg(`, `export default moc;` → `export default mocg;`, and update internal references (incl. the JSDoc examples on lines ~110–120 and the comment on ~182). All subpath re-exports and `create*Config` names stay.
- [x] 2.2 In `src/cli/project.ts`: update the generator (lines ~111, ~113) so it emits `import { mocg } from '${PACKAGE_NAME}'` and `mocg({...})` / `mocg()`.
- [x] 2.3 Grep `src/` for any remaining `MocOptions` references (e.g. option-type imports) and rename to `MocgOptions`.

## 3. Source JSDoc + runtime literal sweep

- [x] 3.1 Update JSDoc/comment examples that reference the old name or export across `src/`: `src/index.ts`, `src/core/manifest.ts` (line ~35), `src/core/detect.ts` (~73, ~76), `src/config/node.eslint.ts`, `src/config/next.eslint.ts`, `src/config/vite.eslint.ts`, `src/config/react-refresh/vite.eslint.ts`, `src/config/react/react.eslint.ts` — swap `@moc-global/eslint-config[/subpath]` → `eslint-config-mocg[/subpath]` and `moc(`/`{ moc }` → `mocg(`/`{ mocg }`.
- [x] 3.2 Fix the hard-coded literal in `src/cli/doctor.ts:100` (`npx @moc-global/eslint-config init`): replace with a value derived from `PACKAGE_NAME` (e.g. `` `npx ${PACKAGE_NAME} init` ``) so it can never drift from the published name again.

## 4. Tests

- [x] 4.1 `tests/stacks.test.mjs:18`: assert `PACKAGE_NAME` `toBe('eslint-config-mocg')`.
- [x] 4.2 `tests/project.test.mjs:21`: assert the generated config `toContain("import { mocg } from 'eslint-config-mocg'")` (both the name and the export).
- [x] 4.3 Grep `tests/` for any other `@moc-global` / `moc(` / `MocOptions` references and update.

## 5. Documentation (VitePress)

- [x] 5.1 `docs/.vitepress/config.mjs`: update `title` (`@moc-global/eslint-config` → `eslint-config-mocg`) and the sidebar label `API: moc() & factories` → `API: mocg() & factories`. Leave the `socialLinks` GitHub URL unchanged.
- [x] 5.2 Sweep the guide/reference pages for the name and export: `docs/index.md`, `docs/guide/{getting-started,how-it-works,stacks,why,versioning,existing-projects,cli,contributing}.md`, `docs/reference/{api,plugins}.md` — `@moc-global/eslint-config[/subpath]` → `eslint-config-mocg[/subpath]`, `moc(` / `{ moc }` / `` `moc()` `` → `mocg` forms, and the `…-2.1.0.tgz` tarball examples → `eslint-config-mocg-2.2.0.tgz`.
- [x] 5.3 Rewrite the now-false claim in `docs/guide/versioning.md:27` ("The public API is unchanged — `moc()` … keep their names") to reflect the 2.2.0 rename to `mocg()` / `eslint-config-mocg`.
- [x] 5.4 Leave company branding untouched: docs footer "Master of Code Global", the logo SVG `moc-logo` id, and `docs/.vitepress/theme/custom.css` "MOC brand" comments. Do not hand-edit `docs/.vitepress/dist/` (gitignored build output).

## 6. Examples — the triad (×5: nest, next, react, typescript, vue)

- [x] 6.1 In each `examples/*/package.json`: rename the dependency key `@moc-global/eslint-config` → `eslint-config-mocg`, update its value to `file:../../eslint-config-mocg-2.2.0.tgz`, and update the `description` text.
- [x] 6.2 In each `examples/*/eslint.config.mjs`: `import { moc } from '@moc-global/eslint-config'` → `import { mocg } from 'eslint-config-mocg'` and `moc(` → `mocg(`.
- [x] 6.3 In each `examples/*/README.md` (and `examples/next-app/app/layout.tsx`): swap the name/export references.

## 7. GitHub meta + root docs

- [x] 7.1 `.github/CODEOWNERS` and `.github/ISSUE_TEMPLATE/bug_report.md`: update `@moc-global/eslint-config` references (do not alter GitHub `@username` handles).
- [x] 7.2 `README.md`: update the H1 + logo `alt` (`@moc-global/eslint-config` → `eslint-config-mocg`), install/usage commands (`npx … init`, dep key, the git+ssh `#semver:^2` line keeps its repo URL), the `import { moc }` example → `mocg`, and the `…-2.1.0.tgz` tarball name → `eslint-config-mocg-2.2.0.tgz`.
- [x] 7.3 `CONTRIBUTING.md` and `scripts/verify-examples.sh:16` (the echo): swap name/export references. NOTE: `CONFIG-RESEARCH.md` / `EXAMPLES-FINDINGS.md` were deliberately **left as historical record** (non-shipped point-in-time research/findings docs; `EXAMPLES-FINDINGS` is "@2.0.0" and references the real 2.0.0-era tarball) — same treatment as the CHANGELOG history and openspec archive.
- [x] 7.5 (discovered during verification) Two root files outside the original sweep groups also referenced the API symbol and were updated: `eslint.config.ts` (the repo's own dogfood config — `import { mocg }` + `await mocg(...)`) and `.husky/pre-push` (a comment mentioning `mocg()`).
- [x] 7.4 `CHANGELOG.md`: add a `## [2.2.0]` entry documenting the package rename (`@moc-global/eslint-config` → `eslint-config-mocg`), the API rename (`moc()`/`MocOptions` → `mocg()`/`MocgOptions`), and the bin rename; add a `[2.2.0]` compare link. Leave the historical `[2.1.0]`/`[2.0.0]` sections unchanged.

## 8. Build & end-to-end verification

- [x] 8.1 `npm run build` and `npm run typecheck` — clean.
- [x] 8.2 `npm run lint` — clean (self-lint with the new `mocg()`).
- [x] 8.3 `npm run test:run` — all green (includes 4.1/4.2 assertions).
- [x] 8.4 `npm run pack:check` (`npm pack --dry-run`) — confirm the tarball resolves to `eslint-config-mocg-2.2.0.tgz` and `files`/`dist` contents are correct.
- [x] 8.5 `npm run verify:examples` — builds, packs the real tarball, installs it into all five examples, and runs each example's typecheck + lint. Must pass (proves the triad in §6 is consistent).

## 9. Stale-token gate

- [x] 9.1 Grep the whole repo (excluding `node_modules`, `dist`, `.git`, `openspec/changes/archive/**`, and the historical `CHANGELOG` sections) for `@moc-global`, `moc-eslint`, `\bmoc\(`, `\bMocOptions\b`, and stray `2.1.0` tarball refs. Require zero hits except the deliberately-preserved repo URL (`dmytro-vakulenko-moc`) and company branding ("Master of Code Global", `moc-logo`).

## 10. Review pass (security + code-review high + Codex adversarial)

- [x] 10.1 Security review — **no findings** (clean publish surface; `PACKAGE_NAME` interpolation is package-controlled + allow-list-validated, no injection).
- [x] 10.2 Code review (high) — **no blocking findings**; deltas confirmed to archive cleanly (headers match verbatim).
- [x] 10.3 Codex adversarial — applied fixes: documented the pre-first-publish minor-bump exception in `docs/guide/versioning.md`; corrected the consumer range example `^2.0.0` → `^2.2.0`; reworded the contradictory source-layering delta scenario ("...is unchanged" → "...resolves after the rename").
- [x] 10.4 Renamed `tests/moc.test.mjs` → `tests/mocg.test.mjs` (filename consistency; internal-only).
- [x] 10.5 **Post-archive cleanup (done):** after `openspec archive` synced the requirement deltas, two living-spec *purpose* paragraphs still referenced `moc()` (`framework-stack-compatibility:4`, `nextjs-stack:6`) — not covered by any MODIFIED requirement. (`source-layering`'s `moc()` lived inside the "Layered source structure" requirement, so the delta already fixed it.) Both purpose lines edited to `mocg()`; living-spec stale-token grep is clean and `openspec validate --specs --strict` passes (9/9).
