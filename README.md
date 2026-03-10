# 👾 Dualtype
> **언어 전환 없이, 두 언어로 동시에 씁니다.**

Dualtype은 macOS 메뉴 바에서 실행되는 이중 언어 초안 작성 앱이에요. 영어와 한국어를 번갈아 쓰는 순간들 — 앱을 전환하거나 입력기를 바꾸는 번거로움 없이, 생각나는 대로 바로 쳐낼 수 있게 만들어졌습니다.

## ✨ 주요 기능

- **타이핑 분리 엔진**: 입력하는 순간, 영어와 한국어가 각각의 버퍼로 자동 분류됩니다.
- **macOS 네이티브**: 메뉴 바에 상주하며 `Cmd+Shift+X`로 언제든지 불러올 수 있어요.
- **ASCII 감성 UI**: 고대비 인터페이스, Phosphor 아이콘, 터미널 느낌의 디자인. 개발자 취향 저격입니다.
- **스마트 메타데이터**: 세션에 태그를 붙이고, 이중 언어 표와 통계가 포함된 Markdown 파일로 내보낼 수 있어요.
- **타자기 모드**: 현재 줄을 화면 중앙에 고정해 집중 모드로 작성할 수 있습니다.
- **멀티 세션 메모리**: 여러 스크래치패드 상태를 저장하고 불러와, 작업 흐름을 끊지 않고 이어갈 수 있어요.

## 🚀 설치하기

1. **[Releases](https://github.com/Ashutos1997/Dualtype/releases)** 페이지에서 최신 `.dmg`를 다운로드하세요.
2. DMG를 열고 **Dualtype.app**을 **Applications** 폴더로 드래그해 주세요.
3. 처음 실행할 때는 **우클릭 → 열기**를 선택하세요. (미서명 앱 경고를 넘기는 방법이에요.)
4. 메뉴 바에서 `[ ]` 아이콘을 찾아보세요!

## 🛠 개발자 설정

소스에서 직접 빌드하고 싶다면:

1. **사전 준비**: [Rust](https://rustup.rs/)와 [Node.js](https://nodejs.org/)가 설치되어 있어야 해요.
2. **의존성 설치**:
   ```bash
   npm install
   ```
3. **개발 모드 실행**:
   ```bash
   npm run tauri dev
   ```
4. **프로덕션 빌드**:
   ```bash
   npm run tauri build
   ```

## 📝 변경 이력

### v1.1.0
* **기능**: 멀티 세션 메모리 추가 — 커맨드 팔레트에서 세션을 저장, 불러오기, 삭제, 목록 확인할 수 있어요.
* **기능**: 커스텀 부팅 사운드 지원 (`boot.mp3`), 오디오 클리핑 처리 포함.
* **보안**: 오프라인 우선 프라이버시 강제 적용. 외부 네트워크 호출 없음 검증 완료.
* **UI/UX**: 세션 목록 오버레이 추가, 닫기 버튼 및 전역 `Esc` 키 처리 개선.

### v1.0.0
* **첫 출시**: 핵심 파싱 엔진, macOS 메뉴 바 통합, Neo-Retro 디자인, 스마트 태그, Markdown 내보내기, 타자기 모드 탑재.

*👾 ⚡ Dualtype Team이 만들었습니다*

-------------------------

# 👾 Dualtype
> **Bilingual drafting without the context switch.**

Dualtype is a specialized macOS Menu Bar application designed for the interstitial drafting phase. It is built for moments when you need to get ideas down in both English and Korean without the friction of manual switching or full blown note taking apps.

## ✨ Features

- **Split on Type Engine**: English and Korean characters are automatically sorted into separate buffers as you type.
- **macOS Native Agent**: Lives exclusively in your menu bar. Access it instantly via `Cmd+Shift+X`.
- **ASCII Inspired Aesthetic**: A developer centric, high contrast interface with Phosphor iconography and modern terminal vibes.
- **Smart Metadata**: Tag your sessions easily and export to Markdown with full bilingual tables and statistics.
- **Typewriter Mode**: Optional active line centering for distraction free drafting.
- **Multi Session Memory**: Save, load, and manage multiple distinct scratchpad states without losing your train of thought.

## 🚀 Installation

1. Download the latest `.dmg` from the **[Releases](https://github.com/Ashutos1997/Dualtype/releases)** page.
2. Open the DMG and drag **Dualtype.app** to your **Applications** folder.
3. **Right click -> Open** to launch the first time (to bypass the unsigned app warning).
4. Look for the `[ ]` split column icon in your top menu bar!

## 🛠 Developer Setup

If you want to build Dualtype from source:

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

*Made with 👾 and ⚡ by [Dualtype Team]*
