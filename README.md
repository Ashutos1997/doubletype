# 👾 Doubletype
> **Bilingual drafting without the context switch.**

Doubletype is a specialized macOS Menu Bar application designed for the interstitial drafting phase. It is built for moments when you need to get ideas down in both English and Korean without the friction of manual switching or full blown note taking apps.

## ✨ Features

- **Split on Type Engine**: English and Korean characters are automatically sorted into separate buffers as you type.
- **macOS Native Agent**: Lives exclusively in your menu bar. Access it instantly via `Cmd+Shift+X`.
- **ASCII Inspired Aesthetic**: A developer centric, high contrast interface with Phosphor iconography and modern terminal vibes.
- **Smart Metadata**: Tag your sessions easily and export to Markdown with full bilingual tables and statistics.
- **Typewriter Mode**: Optional active line centering for distraction free drafting.
- **Multi Session Memory**: Save, load, and manage multiple distinct scratchpad states without losing your train of thought.

## 🚀 Installation

1. Download the latest `.dmg` from the **[Releases](https://github.com/Ashutos1997/doubletype/releases)** page.
2. Open the DMG and drag **Doubletype.app** to your **Applications** folder.
3. **Right click -> Open** to launch the first time (to bypass the unsigned app warning).
4. Look for the `[ ]` split column icon in your top menu bar!

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

## 📝 Changelog

### v1.1.0
* **Feature**: Added Multi Session Memory. You can now save, load, delete, and list distinct scratchpad states via the Command Palette.
* **Feature**: Added custom boot audio support (`boot.mp3`) with localized audio clipping.
* **Security**: Enforced offline first privacy constraints. Verified zero network call leaks.
* **UI/UX**: Added new session UI list overlay with dedicated close buttons and global `Esc` key handling.

### v1.0.0
* **Initial Release**: Core parsing engine, macOS Menu Bar integration, neo retro styling, smart tags, markdown export, and typewriter features deployed.

*Made with 👾 and ⚡ by [Doubletype Team]*
