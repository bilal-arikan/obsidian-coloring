# Obsidian File Color Picker

Color files and folders in the [Obsidian](https://obsidian.md) file explorer with a
**native color picker**. Inspired by
[ecustic/obsidian-file-color](https://github.com/ecustic/obsidian-file-color), but
without a fixed palette: right-click → **Set color** and pick any color you want.
Chosen colors are saved to a reusable palette, and an opened colored file can tint
its own tab header.

<!-- Add a screenshot here once captured, e.g.:
<img width="700" alt="File Color Picker" src="https://github.com/user-attachments/assets/..." /> -->

## Quick Install

[![Install in Obsidian via BRAT](https://img.shields.io/badge/Obsidian-Install%20via%20BRAT-7C3AED?style=for-the-badge&logo=obsidian&logoColor=white)](https://bilal-arikan.github.io/obsidian-coloring/install.html)

The button opens Obsidian and asks **BRAT** to add this repo. It needs the
[BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin installed and a
published GitHub release. If your browser blocks the redirect, paste this into the
address bar instead:

```
obsidian://brat?plugin=bilal-arikan/obsidian-coloring
```

> GitHub strips custom-scheme (`obsidian://`) links in markdown, so the button
> points to a tiny HTTPS redirect page ([`install.html`](install.html) on GitHub
> Pages) that forwards to the Obsidian URI. The official
> `obsidian://show-plugin?id=` deep link only works for store-listed plugins.

## Features

- **Native color picker** — right-click any file/folder → *Set color* opens a real
  `<input type="color">`; no need to pre-define a palette.
- **Growing palette** — every color you pick is saved automatically and re-applied
  later with a single click from the swatch grid.
- **Tab header tinting** — open a colored file and its tab title (plus an underline
  accent) is tinted with the file's color. Toggleable.
- **Text or background** — color the row text or a soft background highlight.
- **Cascade to children** — apply a folder's color to everything inside it.
- **Import from "File Color"** — one-click migration of the palette and assignments
  from [ecustic/obsidian-file-color](https://github.com/ecustic/obsidian-file-color)
  in the same vault (its `id → hex` mapping is resolved automatically).

## Quick Start

### 1. Install

Via [BRAT](#quick-install) (mobile-friendly) or copy `main.js`, `manifest.json`,
`styles.css` into `<Vault>/.obsidian/plugins/file-color-picker/`, then enable
**File Color Picker** in *Community plugins*.

### 2. Color a file

Right-click a file or folder → **Set color**:

| Action | What it does |
|--------|--------------|
| **Saved colors** grid | Click a swatch to apply a previously used color |
| **Pick a new color** | Choose any color, optional name, *Add & apply* |
| **Remove color** | Clear the current assignment |

Open a colored file and its tab header is tinted automatically.

### 3. Migrate from "File Color" (optional)

If you already used [ecustic/obsidian-file-color](https://github.com/ecustic/obsidian-file-color):
go to **Settings → File Color Picker → Import from "File Color"**. If the original
plugin's data is found in this vault, its counts are shown — click **Import now** to
merge. Existing colors are kept; matching paths are updated.

### 4. Build from source (optional)

```bash
npm install
npm run build
```

## Installing on Other Devices (macOS, iOS, Android)

The plugin is three files — `main.js`, `manifest.json`, `styles.css` — that must live
in `<Vault>/.obsidian/plugins/file-color-picker/` on each device. There are two ways:

### Option A — BRAT (recommended for mobile)

1. In Obsidian, install the **BRAT** community plugin.
2. BRAT → *Add beta plugin* → enter `bilal-arikan/obsidian-coloring`.
3. BRAT downloads the latest GitHub release and keeps it updated.
4. Enable **File Color Picker** in *Community plugins*.

> Requires a GitHub release that includes `main.js`, `manifest.json`, `styles.css`.

### Option B — Manual copy

- **macOS:** copy the three built files into
  `<Vault>/.obsidian/plugins/file-color-picker/`, then enable the plugin.
- **Android:** use a file manager to create the same folder inside your vault and
  copy the three files in.
- **iOS:** place the files via the Files app (vault must be under *On My iPhone →
  Obsidian* or iCloud Drive), then enable the plugin.

## How It Works

Colors are stored per path in settings (`{ path, value }`, where `value` is a hex
color). On layout and active-file changes the plugin re-applies styling:

- **File explorer** — each colored row gets a `--file-color-color` CSS custom
  property set inline; `styles.css` reads it for text or background coloring. Because
  custom properties inherit, the *cascade* mode flows a folder color to its children.
- **Tab headers** — for every open leaf with a file, the matching color is written
  to the leaf's tab title element and an underline accent, driven by Obsidian's
  internal `tabHeaderInnerTitleEl` / `tabHeaderEl`.
- **Import** — reads the original plugin's `data.json` via the vault adapter and
  resolves its palette `id → hex` so its `{ path, color: id }` records become our
  `{ path, value: hex }`.

## Development

```bash
npm run dev      # esbuild watch
npm run build    # type-check + production bundle
```

| Module | Responsibility |
|--------|----------------|
| `src/main.ts` | Plugin lifecycle, events, settings load/save |
| `src/settings.ts` | Settings types, defaults, helpers |
| `src/SetColorModal.ts` | Right-click "Set color" picker modal |
| `src/colorApplier.ts` | Applies colors to the file explorer and tab headers |
| `src/SettingsTab.ts` | Settings panel, palette management, import |
| `src/importer.ts` | Migration from ecustic/obsidian-file-color |
| `src/obsidian-internals.ts` | Narrow typings for non-public Obsidian internals |

## Author

**Bilal Arikan**
- GitHub: [@bilal-arikan](https://github.com/bilal-arikan)
- Email: bilal1993arikan@gmail.com

## License

[MIT](LICENSE) © Bilal Arikan
