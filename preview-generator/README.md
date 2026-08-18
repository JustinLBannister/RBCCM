# preview-generator

Static content editor for RBCCM components. Each subfolder is one component's CMS UI. Editors change copy in the browser and download a self-describing JSON file to hand off; the receiving developer drops it into TeamSite's asset library and previews with `?preview=<slug>`.

No auth, no backend, no email. The file itself is the artifact.

---

## Structure

```
preview-generator/
├── index.html          Landing page (links to every editor)
├── maas-mata/
│   └── index.html      MAAS + MATA landing-page editor
├── vercel.json         Static hosting config
├── package.json        Dev-server scripts
└── .gitignore
```

Add a new component by copying `maas-mata/` to `your-component/`, editing its SCHEMA + SAMPLE, and adding an `<a>` on the landing page.

---

## Local dev

```bash
npm start
# serves at http://localhost:5173
```

Or just open `index.html` in a browser — everything is plain static HTML/JS.

---

## Deploy (first time)

Repo is intended to live at the parent `RBCCM-CMS/` folder. In Vercel:

1. Push `RBCCM-CMS/` to GitHub as a private repo
2. Vercel → **Add New** → **Project** → Import the repo
3. Framework preset: **Other**
4. **Root Directory**: click **Edit** → select `preview-generator/`
5. Deploy — done. Note the URL (e.g. `preview-generator.vercel.app`).

Every future `git push` auto-deploys.

---

## How editors use it

1. Open `https://preview-generator.vercel.app/maas-mata/`
2. Edit copy across the section panels
3. Click **Export draft → download**
4. Modal appears — fill in your name (remembered next time) + optional note
5. Click **Download JSON** — file downloads as `maas-mata-draft_<timestamp>_<name>.json`
6. Attach to Asana task with a note

## How developers apply the draft

1. Download the JSON from Asana
2. Upload to TeamSite asset library at `/assets/maas-mata/maas-mata-draft.json`
3. Visit the page URL with `?preview=draft` appended — the page loads the draft instead of production data
4. If approved, rename/overwrite the production `maas-mata.json` and publish

The consuming page loads whichever data source matches the `?preview=<slug>` param. The `_meta` block inside the JSON is ignored by the data binder (no `data-json` path targets it), so the same file works as-is when promoted to production.

---

## JSON payload shape

Every export wraps the page data in a `_meta` block that names the editor, timestamp, and which sections changed:

```json
{
  "_meta": {
    "generatedAt": "2026-08-17T14:45:23.000Z",
    "editor": "Joon",
    "note": "Q4 hero copy pass",
    "sectionsChanged": ["hero (2 fields)", "newStandard (1 field)"],
    "sectionsUnchanged": ["chartCard", "awards", "..."],
    "changedPaths": ["hero.subtitle", "hero.eyebrow", "newStandard.body[1]"],
    "previewInstructions": "Upload this JSON to TeamSite at ..."
  },
  "hero": { ... },
  "chartCard": { ... }
}
```

`changedPaths` is a flat list of every leaf field that differs from the seed content — useful for eyeballing scope before applying.
