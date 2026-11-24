# RBCCM Global (local preview of every component)

Not a component. This folder builds one local page that stacks every component's preview, with a picker across the top, so the whole library can be reviewed in one place. Nothing here is deployed to rbccm.com and there is nothing for an editor to fill in.

---

## For editors and BAs

### Purpose

A review tool. It answers "what components exist and what do they look like" without opening each folder.

### What you can do with it

- Switch between components with the picker, or choose "Show all" to stack them.
- Use "Build a page" to tick components and get the build command for that combination.

### What it does not do

- It does not show live content. Components that read live rbccm.com feeds show their sample or fallback content here.
- It is not a page on the website and is not a TeamSite component.
- It leaves out the few components with no preview page of their own. The package README lists them.

### How to open it

Follow "Preview the components" in the package README: start the local server, then open `rbccm-global/local-test.html`.

---

## Files

| File | What it is |
|---|---|
| `local-test.html` | The combined preview page. Generated; do not edit by hand. |
| `build-global.mjs` | Rebuilds `local-test.html` from each component's own preview page (`npm run global`). |
| `bundle-global.mjs` | Makes a self-contained copy of the preview and zips it (`npm run global:bundle`). |
| `dist/` | Output of the bundle step. |
