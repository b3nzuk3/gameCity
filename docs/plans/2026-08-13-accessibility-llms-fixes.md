# Accessibility and llms.txt Fixes Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Resolve the reported mobile accessibility-name audits and publish a valid, crawlable `/llms.txt` document without changing existing navigation, styling, search behavior, routing, or build-time catalog generation.

**Architecture:** Make the smallest scoped UI change in `Navbar.tsx`: provide accessible names for icon-only mobile controls and ensure the cart link itself is the named interactive element. Keep the existing Sheet state, routes, handlers, visual classes, and cart badge behavior intact. Add a static Markdown file under `public/`, which Vite copies unchanged to the site root; do not add a new runtime route or modify SPA fallback behavior.

**Tech Stack:** React 18, TypeScript, React Router, Radix Sheet via shadcn/ui, lucide-react, Vite, Node test runner, ESLint.

---

## Current Findings and Constraints

- Frontend repository: `/root/projects/client-projects/game-city/gameCity`.
- Mobile controls are implemented in `src/components/Navbar.tsx` around lines 371–407.
- The reported cart issue is the `<Link to="/cart">` around lines 386–399, which currently exposes only an icon-only nested button to assistive technology.
- The mobile search and menu controls are also icon-only and should be named in the same change to prevent adjacent audit failures.
- There is currently no `public/llms.txt` source file.
- The existing build command is:
  `node scripts/catalog-manifest.mjs && npm run generate:sitemap && vite build`.
- Existing unrelated worktree changes must be preserved:
  - modified `.gitignore`
  - untracked `scripts/google_indexing.py`
- Do not commit, push, merge, or modify those unrelated files as part of this work.

## Acceptance Criteria

1. The mobile search button has a stable accessible name such as `Search` or `Open search`.
2. The mobile cart link has a stable accessible name such as `Cart` or `View cart`, and remains a link to `/cart`.
3. The cart badge remains visible and continues to display `totalItems` when nonzero.
4. The mobile menu Sheet trigger has a stable accessible name such as `Open menu` and retains its existing open/close behavior.
5. Decorative Lucide icons do not create duplicate or misleading accessible names.
6. `public/llms.txt` begins with an H1 heading and contains useful Markdown links to the homepage, catalog/search, categories, sitemap, contact, and policy pages.
7. The production build copies `llms.txt` to `dist/llms.txt` unchanged and does not regress generated catalog/sitemap output.
8. Focused source checks, tests, lint, build, and a browser/HTTP smoke test provide fresh evidence.
9. No unrelated working-tree changes are overwritten.

## Implementation Tasks

### Task 1: Add accessible names to the mobile search control

**Objective:** Give the icon-only mobile search button a clear accessible name without changing its click behavior or appearance.

**Files:**
- Modify: `src/components/Navbar.tsx:374-383`

**Steps:**

1. Add `aria-label="Open search"` (or an equivalent concise label) to the existing mobile `Button`.
2. Preserve the existing `onClick`, variant, size, classes, and `Search` icon.
3. Mark the icon `aria-hidden="true"` only if needed by the rendered button semantics; do not hide the only accessible name.

**Verification:**

- Confirm the button still sets `isMobileMenuOpen(true)`.
- Confirm the rendered control has one non-empty accessible name.

### Task 2: Make the mobile cart link an accessible, valid navigation control

**Objective:** Ensure the `/cart` link itself is discoverable as a named link and avoid relying on a nested icon-only button for its name.

**Files:**
- Modify: `src/components/Navbar.tsx:385-400`

**Steps:**

1. Add `aria-label="View cart"` or `aria-label={`View cart (${totalItems} items)`}` to the `<Link>`.
2. Preserve the `/cart` destination, relative positioning, cart icon, badge logic, and styling.
3. Prefer changing the nested `Button` to a non-interactive styled wrapper if the component API and existing CSS require it, because an interactive button nested inside an anchor creates invalid/ambiguous control semantics.
4. If retaining the nested `Button` is necessary for visual consistency, ensure it is not independently focusable or interactive and that the link remains the sole navigation control. Do not add a second click handler.
5. Mark the cart icon decorative with `aria-hidden="true"` when the link has the accessible name.
6. Ensure the badge is not announced as a second confusing control label; use `aria-hidden="true"` on the badge if the link label already includes the item count, or keep the label as simply `View cart` and leave the visual badge separate.

**Verification:**

- Inspect the rendered mobile DOM with an accessibility tree or browser snapshot.
- Confirm exactly one named `/cart` link is exposed for the mobile action.
- Confirm clicking/tapping the cart action still navigates to `/cart`.
- Confirm both zero-item and nonzero-item states render correctly.

### Task 3: Name the mobile menu Sheet trigger

**Objective:** Prevent the adjacent icon-only menu trigger from failing the same audit and preserve Sheet behavior.

**Files:**
- Modify: `src/components/Navbar.tsx:401-407`

**Steps:**

1. Add `aria-label="Open menu"` to the `Button` inside `SheetTrigger`.
2. Add `aria-expanded={isMobileMenuOpen}` only if the underlying Sheet trigger does not already provide it; avoid duplicate/conflicting ARIA state.
3. Keep the existing `Sheet` controlled state and `onOpenChange` untouched.
4. Mark the `Menu` icon decorative if the button label is present.

**Verification:**

- Open and close the mobile Sheet.
- Confirm `isMobileMenuOpen` still tracks the Sheet state.
- Confirm the trigger has a meaningful accessible name in both closed and open states.

### Task 4: Add a valid static `llms.txt` source document

**Objective:** Provide a standards-oriented Markdown document that satisfies the audit and helps AI systems discover the site’s canonical resources.

**Files:**
- Create: `public/llms.txt`

**Content requirements:**

1. First non-blank content should be an H1, for example:
   `# Gamecity Electronics`
2. Include a concise description identifying Gamecity Electronics as a gaming components and accessories retailer in Nairobi, Kenya.
3. Include Markdown links using absolute canonical URLs, including at minimum:
   - Homepage: `https://www.gamecityelectronics.co.ke/`
   - Product/search catalog: `https://www.gamecityelectronics.co.ke/search`
   - Categories: `https://www.gamecityelectronics.co.ke/category/all`
   - Sitemap: `https://www.gamecityelectronics.co.ke/sitemap.xml`
   - Contact: `https://www.gamecityelectronics.co.ke/contact`
   - Privacy and terms pages
4. Optionally link to the public catalog manifest only if it is intended for public machine consumption and its current URL is stable.
5. Do not include private/admin routes, API credentials, internal implementation details, or instructions that override normal crawler policies.
6. Keep the file static and concise. Do not generate it from the product API, so a temporary API outage cannot remove the required H1 or links.

**Verification:**

- Confirm the file is valid UTF-8 Markdown.
- Confirm it contains exactly/at least one H1 and multiple Markdown links.
- Confirm no secret, admin, or private endpoint is included.

### Task 5: Add focused regression checks for the static document and source semantics

**Objective:** Catch future regressions without introducing a browser-testing dependency or coupling tests to Tailwind class names.

**Files:**
- Create or modify: `tests/accessibility-llms.test.mjs`
- Modify: `package.json` only if a focused test script is needed

**Steps:**

1. Add a Node test that reads `public/llms.txt` and asserts:
   - H1 exists
   - at least two Markdown links exist
   - required canonical URLs are present
   - no obvious private/admin URL is present
2. Add lightweight source assertions for `Navbar.tsx` only if the repository’s existing test style accepts source-level checks; assert the relevant mobile controls contain accessible-name attributes, not exact class strings.
3. Avoid brittle tests based on generated Tailwind output or exact whitespace.
4. If adding a script, use a clear name such as `test:accessibility-llms` and keep all existing scripts unchanged.

**Verification:**

Run the new focused test and expect all assertions to pass.

### Task 6: Run changed-file lint and the existing test suite

**Objective:** Prove the changes do not introduce TypeScript/ESLint or regression-test failures.

**Files:**
- No source changes; verification only.

**Commands:**

```bash
npm run test:accessibility-llms
npm run test:middleware
npm run test:seo
npm run test:search
npm run test:geo
npm run lint -- src/components/Navbar.tsx
```

Then run the full lint command:

```bash
npm run lint
```

**Expected evidence:**

- Focused tests pass.
- Existing tests pass, or failures are clearly identified as pre-existing and unrelated.
- Changed-file lint passes.
- Full lint result is reported separately from targeted lint; do not hide unrelated baseline failures.

### Task 7: Run the production build and verify generated artifacts

**Objective:** Confirm Vite still builds the site and copies the static file without damaging generated catalog or sitemap behavior.

**Files:**
- Generated `dist/` output may change during verification; inspect and preserve/revert generated-only changes unless they are intentional deliverables.

**Commands:**

```bash
npm run build
```

Then verify the artifact:

```bash
test -s dist/llms.txt
head -n 1 dist/llms.txt
grep -E '^# |\[[^]]+\]\(https?://[^)]+\)' dist/llms.txt
```

Also inspect:

```bash
git diff --check
git status --short --branch
```

**Expected evidence:**

- Build exits successfully.
- `dist/llms.txt` exists, is non-empty, begins with the H1, and contains links.
- Existing `dist/sitemap.xml`, catalog manifest, and representative HTML routes remain generated.
- Any build-generated changes unrelated to this task are identified and not accidentally committed.

### Task 8: Run local browser and HTTP smoke verification

**Objective:** Confirm real runtime accessibility and static-file serving behavior rather than relying only on source/build checks.

**Steps:**

1. Start the Vite preview on an explicitly chosen free port, for example `npm run preview -- --host 127.0.0.1 --port 4173`.
2. Request `/llms.txt` directly and confirm HTTP 200, Markdown-like content, H1, and links. Confirm it is not an HTML SPA shell.
3. Open the homepage in a real browser at the actual preview URL.
4. Use a mobile viewport or the project’s responsive layout to inspect the Navbar accessibility tree.
5. Confirm named controls for search, cart, and menu are exposed.
6. Activate search, cart, and menu; verify the existing interactions still work.
7. Check browser console after navigation and interactions for uncaught application errors.
8. Stop the preview process after verification.

**Expected evidence:**

- `/llms.txt` is served directly with status 200.
- Mobile controls have discernible names.
- Search opens the existing mobile Sheet, cart navigates to `/cart`, and menu opens/closes normally.
- No new console errors or hydration warnings occur.

### Task 9: Final worktree and scope review

**Objective:** Ensure only intended files are changed and unrelated user work is preserved.

**Commands:**

```bash
git diff -- src/components/Navbar.tsx public/llms.txt tests/accessibility-llms.test.mjs package.json
git status --short --branch
git diff --check
```

**Expected result:**

- Intended changes are limited to the Navbar accessibility attributes/structure, `public/llms.txt`, and optional focused test/script files.
- `.gitignore` and `scripts/google_indexing.py` remain exactly as they were before this task.
- No commit, push, merge, or branch change occurs unless explicitly requested.

## Out of Scope

- Rebuilding the full accessibility tree or redesigning the Navbar.
- Changing desktop navigation behavior.
- Changing routes, SEO metadata, robots.txt, sitemap generation, catalog generation, or API behavior unless verification discovers a directly caused regression.
- Adding an AI crawler API, server-side route, or dynamic product dump to `llms.txt`.
- Fixing unrelated accessibility findings not included in the reported audit.
- Committing or pushing changes without explicit approval.

## Final Report Format

Report these separately:

- Files changed.
- Focused test result and exact command.
- Existing test result and exact command.
- Targeted lint result.
- Full lint result, including unrelated baseline failures if any.
- Production build result.
- Browser/HTTP smoke result, including the actual preview URL and `/llms.txt` status.
- Console findings.
- Worktree/branch state.
- Any unverified or blocked checks.

Never report “everything works” unless the production build and real browser/HTTP checks have actually completed successfully.

## Handoff

Plan complete and saved. Ready to execute using subagent-driven-development with focused implementation and verification passes.