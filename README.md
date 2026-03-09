# 👾 Doubletype v1.0
> **Bilingual clarity without the context switch.**

Doubletype is a specialized macOS Menu Bar application designed for the "interstitial" drafting phase — where you need to get ideas down in both English and Korean without the friction of manual switching or full-blown note-taking apps.

---

## ✨ Features

- **Split-on-Type™ Engine**: English and Korean characters are automatically sorted into separate buffers as you type.
- **macOS Native Agent**: Lives exclusively in your menu bar. Access it instantly via `Cmd+Shift+X`.
- **ASCII-Inspired Aesthetic**: A developer-centric, high-contrast interface with Phosphor iconography and modern terminal vibes.
- **Smart Metadata**: Tag your sessions easily and export to Markdown with full bilingual tables and statistics.
- **Typewriter Mode**: Optional active-line centering for distraction-free drafting.
- **Launch on Login**: Always ready in the background.

## 🚀 Installation (v1.0.0-release)

1. Download the latest `.dmg` from the **[Releases](https://github.com/TODO_USER_GITHUB_NAME/doubletype/releases)** page.
2. Open the DMG and drag **Doubletype.app** to your **Applications** folder.
3. **Right-click -> Open** to launch the first time (to bypass the unsigned app warning).
4. Look for the `[ ]` split-column icon in your top menu bar!

## 🛠 Developer Setup

If you want to build Doubletype from source:

1. **Prerequisites**: Ensure you have [Rust](https://rustup.rs/) and [Node.js](https://nodejs.org/) installed.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run in Dev Mode**:
   ```bash
   npm run tauri dev
   ```
4. **Build Production Bundle**:
   ```bash
   npm run tauri build
   ```

---

*Made with 👾 and ⚡ by [Doubletype Team]*
