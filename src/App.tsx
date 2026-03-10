import { useState, useEffect, useRef } from "react"
import { register, unregister } from "@tauri-apps/plugin-global-shortcut"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { LogicalPosition } from "@tauri-apps/api/dpi"
import { save } from "@tauri-apps/plugin-dialog"
import { writeTextFile } from "@tauri-apps/plugin-fs"
import {
    SpeakerSimpleHigh, SpeakerSimpleX,
    ArrowsInLineVertical, TextAlignCenter,
    CopySimple, Command, Translate
} from "@phosphor-icons/react"
import { playBootCustom, loadCustomBootAudio, stopBootCustom } from "./utils/audioSystem"
import "./App.css"

export interface Session {
    text: string;
    tags: string[];
    lastModified: number;
}

export default function App() {
    const [rawText, setRawText] = useState("")
    const [isLoaded, setIsLoaded] = useState(false)
    const [isPaletteOpen, setIsPaletteOpen] = useState(false)
    const [paletteInput, setPaletteInput] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [isOnboarding, setIsOnboarding] = useState(false)
    const [bootLine, setBootLine] = useState(0)
    const [bootStarted, setBootStarted] = useState(false)
    const [isHelpOpen, setIsHelpOpen] = useState(false)
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
    const [preferredLang, setPreferredLang] = useState<"eng" | "kor">(
        (Intl.DateTimeFormat().resolvedOptions().locale.startsWith("ko") || navigator.language.startsWith("ko")) ? "kor" : "eng"
    )
    const [theme, setTheme] = useState<string>(localStorage.getItem("scratch_theme") || "default")
    const [isMuted, setIsMuted] = useState<boolean>(localStorage.getItem("scratch_muted") === "true")
    const [isTypewriter, setIsTypewriter] = useState(false)
    const [isExiting, setIsExiting] = useState(false)
    const [isEntering, setIsEntering] = useState(false)
    const [langSwitched, setLangSwitched] = useState<"eng" | "kor" | null>(null)
    const [copyFlash, setCopyFlash] = useState<"ENG" | "KOR" | null>(null)
    const [removingTags, setRemovingTags] = useState<Set<number>>(new Set())

    // Session State
    const [sessions, setSessions] = useState<Record<string, Session>>({})
    const [isSessionListOpen, setIsSessionListOpen] = useState(false)
    const [uiLang, setUiLang] = useState<"en" | "ko">(
        (localStorage.getItem("scratch_uilang") as "en" | "ko") ||
        ((Intl.DateTimeFormat().resolvedOptions().locale.startsWith("ko") || navigator.language.startsWith("ko")) ? "ko" : "en")
    )

    // UI translations
    const T = {
        en: {
            engStrip: "ENG.STRIP", korStrip: "KOR.STRIP",
            copied: "// COPIED",
            metadata: "METADATA:", noTags: "00_TAGS",
            normScroll: "NORM_SCROLL", typeCenter: "[TYPE_CENTER]",
            mute: "MUTE", click: "CLICK",
            engWord: "W", engChar: "C",
            menu: "CMD+K // MENU",
            ready: "Ready", cmdMode: "Command Mode",
            helpTitle: "SYSTEM.HELP // AVAILABLE_COMMANDS",
            placeholder: "Enter :help, :clear, or a tag...",
            understood: "// UNDERSTOOD.", close: "// CLOSE.",
            bootLines: [
                "BILINGUAL ENGINE LOADED.",
                "TYPE ANYTHING. ENG AND KOR SPLIT AUTOMATICALLY.",
                "CMD+K TO TAG. ESC TO DISMISS.",
                "CLICK HEADERS TO COPY BUFFERS.",
                "INITIALIZING SCRATCHPAD...",
            ],
            help: {
                reset: "HARD RESET (WIPE ALL)", clear: "WIPE ALL DATA + TAGS",
                help: "SHOW THIS MENU", themes: "SWITCH PHOSPHOR THEME",
                mute: "TOGGLE KEYCLICK AUDIO", export: "SAVE TO MARKDOWN FILE",
                typewriter: "TOGGLE ACTIVE LINE CENTERING", tag: "ADD NEW METADATA TAG",
                cmdK: "OPEN COMMAND PALETTE", esc: "HIDE APP / DISMISS MENU",
                clickTag: "DELETE INDIVIDUAL TAG", clickHeader: "COPY COLUMN TO CLIPBOARD",
                lang: "SWITCH UI LANGUAGE (en / ko)",
                save: "SAVE CURRENT SESSION", load: "LOAD SAVED SESSION",
                list: "LIST SAVED SESSIONS", delete: "DELETE SESSION",
            },
            cmds: {
                reset: ":reset", clear: ":clear", help: ":help",
                mute: ":mute|unmute", export: ":export", typewriter: ":typewriter",
                lang: ":lang en|ko", tag: "[tag]",
                save: ":save [name]", load: ":load [name]", list: ":list", delete: ":delete [name]"
            },
            keys: {
                cmdK: "CMD+K", esc: "ESC", clickTag: "CLICK TAG", clickHeader: "CLICK HEADER"
            }
        },
        ko: {
            engStrip: "영어 버퍼", korStrip: "한국어 버퍼",
            copied: "// 복사됨",
            metadata: "태그:", noTags: "태그 없음",
            normScroll: "일반 스크롤", typeCenter: "[타이프라이터]",
            mute: "음소거", click: "클릭음",
            engWord: "단어", engChar: "자",
            menu: "CMD+K // 메뉴",
            ready: "준비됨", cmdMode: "명령 모드",
            helpTitle: "시스템 도움말 // 명령어 목록",
            placeholder: ":도움말, :지우기 또는 태그 입력...",
            understood: "// 확인했습니다.", close: "// 닫기.",
            bootLines: [
                "이중 언어 엔진 로드 완료.",
                "내용을 입력하면 영어와 한국어가 자동으로 분리됩니다.",
                "CMD+K로 태그를 추가하고 ESC로 닫을 수 있습니다.",
                "헤더를 클릭하여 각 언어 버퍼를 복사하세요.",
                "스크래치패드 초기화 중...",
            ],
            help: {
                reset: "초기화 (모든 데이터 삭제)", clear: "텍스트 및 태그 삭제",
                help: "이 메뉴 표시", themes: "테마 변경",
                mute: "키 클릭 소리 켜기/끄기", export: "마크다운 파일로 저장",
                typewriter: "타이프라이터 모드 전환", tag: "메타데이터 태그 추가",
                cmdK: "명령 팔레트 열기", esc: "앱 숨기기 / 메뉴 닫기",
                clickTag: "태그 삭제", clickHeader: "열 내용 클립보드에 복사",
                lang: "UI 언어 변경 (한국어 / 영어)",
                save: "현재 세션 저장", load: "저장된 세션 불러오기",
                list: "저장된 세션 목록", delete: "세션 삭제",
            },
            cmds: {
                reset: ":초기화", clear: ":지우기", help: ":도움말",
                mute: ":음소거|음소거해제", export: ":내보내기", typewriter: ":타이프라이터",
                lang: ":언어 en|ko", tag: "[태그]",
                save: ":저장 [이름]", load: ":불러오기 [이름]", list: ":목록", delete: ":삭제 [이름]"
            },
            keys: {
                cmdK: "CMD+K", esc: "ESC", clickTag: "태그 클릭", clickHeader: "헤더 클릭"
            }
        }
    } as const
    const ui = T[uiLang]

    const [confirmPending, setConfirmPending] = useState<string | null>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const paletteRef = useRef<HTMLInputElement>(null)
    const bootSoundPlayedRef = useRef(false)

    const isPaletteOpenRef = useRef(isPaletteOpen);
    useEffect(() => {
        isPaletteOpenRef.current = isPaletteOpen;
    }, [isPaletteOpen]);

    const parseText = (text: string) => {
        const ENG_RE = /[a-zA-Z0-9]/
        const KOR_RE = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/
        let eng = ""
        let kor = ""
        let lane: "eng" | "kor" = "eng" // neutral chars go to whichever lane was last active
        for (const ch of text) {
            if (ENG_RE.test(ch)) { lane = "eng"; eng += ch }
            else if (KOR_RE.test(ch)) { lane = "kor"; kor += ch }
            else {
                if (lane === "eng") eng += ch
                else kor += ch
            }
        }
        return {
            engOut: eng.trim(),
            korOut: kor.trim()
        }
    }
    const { engOut, korOut } = parseText(rawText)

    const getStats = (text: string) => {
        const chars = text.length
        const words = text.trim() ? text.trim().split(/\s+/).length : 0
        return { chars, words }
    }
    const engStats = getStats(engOut)
    const korStats = getStats(korOut)

    const prevTextLengthRef = useRef(0)
    useEffect(() => {
        const isDeletion = rawText.length < prevTextLengthRef.current
        prevTextLengthRef.current = rawText.length

        if (isDeletion) return // Don't jump languages when deleting

        const lastChar = rawText.trimEnd().slice(-1)
        if (lastChar) {
            const isK = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(lastChar)
            const isE = /[a-zA-Z0-9]/.test(lastChar)
            if (isK) setPreferredLang("kor")
            else if (isE) setPreferredLang("eng")
        }
    }, [rawText])

    const prevLangRef = useRef(preferredLang)
    useEffect(() => {
        if (preferredLang !== prevLangRef.current) {
            setLangSwitched(preferredLang)
            setTimeout(() => setLangSwitched(null), 560)
            prevLangRef.current = preferredLang
        }
    }, [preferredLang])

    const active = preferredLang

    // Animated hide helper — plays exit animation before actually hiding the window
    const animatedHide = async () => {
        // Save window position before hiding
        try {
            const pos = await getCurrentWindow().outerPosition()
            localStorage.setItem("scratch_win_x", String(pos.x))
            localStorage.setItem("scratch_win_y", String(pos.y))
        } catch { }
        setIsExiting(true)
        await new Promise(r => setTimeout(r, 280))
        setIsExiting(false)
        await getCurrentWindow().hide()
    }

    // Restore saved window position on first load
    useEffect(() => {
        const savedX = localStorage.getItem("scratch_win_x")
        const savedY = localStorage.getItem("scratch_win_y")
        if (savedX && savedY) {
            getCurrentWindow().setPosition(new LogicalPosition(parseInt(savedX), parseInt(savedY)))
                .catch(() => { })
        }
    }, [])

    // Listen for window re-focus (tray click / shortcut show) to replay entrance
    useEffect(() => {
        let unlisten: (() => void) | undefined
        getCurrentWindow().onFocusChanged(({ payload: focused }) => {
            if (focused) {
                setIsEntering(true)
                setTimeout(() => setIsEntering(false), 400)
                setTimeout(() => inputRef.current?.focus(), 50)
            }
        }).then(fn => { unlisten = fn })
        return () => { unlisten?.() }
    }, [])

    useEffect(() => {
        const SHORTCUT = "CommandOrControl+Shift+X"
        const setup = async () => {
            try {
                await unregister(SHORTCUT).catch(() => { })
                await register(SHORTCUT, async (event) => {
                    if (event.state === "Pressed") {
                        const appWindow = getCurrentWindow()
                        const isVisible = await appWindow.isVisible()
                        if (isVisible) await animatedHide()
                        else {
                            await appWindow.show()
                            await appWindow.setFocus()
                        }
                    }
                })
            } catch (e) { console.error("Global shortcut registration failed:", e) }
        }
        setup()
        return () => { unregister(SHORTCUT).catch(() => { }) }
    }, [])

    useEffect(() => {
        const savedData = localStorage.getItem("scratch_text")
        const savedTags = localStorage.getItem("scratch_tags")
        const savedTheme = localStorage.getItem("scratch_theme")
        const savedSessions = localStorage.getItem("scratch_sessions")
        if (savedData) setRawText(savedData)
        if (savedTags) setTags(JSON.parse(savedTags))
        if (savedTheme) setTheme(savedTheme)
        if (savedSessions) {
            try {
                setSessions(JSON.parse(savedSessions))
            } catch (e) { }
        }
        const savedUiLang = localStorage.getItem("scratch_uilang")
        if (savedUiLang === "en" || savedUiLang === "ko") setUiLang(savedUiLang)
        setIsLoaded(true)
        if (!localStorage.getItem("seen_onboarding")) setIsOnboarding(true)

        // Preload the custom boot MP3 in the background
        loadCustomBootAudio("/boot.mp3")

    }, [])

    const BOOT_LINES = ui.bootLines

    useEffect(() => {
        const handleStartBoot = (e: KeyboardEvent | MouseEvent) => {
            if (isOnboarding && !bootStarted) {
                // Prevent palette from opening on cmd+k during boot start
                if (e instanceof KeyboardEvent && e.key === "Escape") return
                setBootStarted(true)
                if (!bootSoundPlayedRef.current) {
                    bootSoundPlayedRef.current = true
                    playBootCustom(isMuted)
                }
            }
        }

        if (isOnboarding && !bootStarted) {
            window.addEventListener("keydown", handleStartBoot)
            window.addEventListener("click", handleStartBoot)
            return () => {
                window.removeEventListener("keydown", handleStartBoot)
                window.removeEventListener("click", handleStartBoot)
            }
        }
    }, [isOnboarding, bootStarted, isMuted])

    useEffect(() => {
        if (!isOnboarding || !bootStarted) return
        if (bootLine < BOOT_LINES.length) {
            const t = setTimeout(() => setBootLine(b => b + 1), 900)
            return () => clearTimeout(t)
        } else {
            // Cut the audio exactly when the 5th line appears
            stopBootCustom()
        }
    }, [isOnboarding, bootStarted, bootLine])

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("scratch_text", rawText)
            localStorage.setItem("scratch_tags", JSON.stringify(tags))
        }
    }, [rawText, tags, isLoaded])

    // Typewriter Mode Auto-Scroll
    useEffect(() => {
        if (!isTypewriter) return
        const activeBox = document.querySelector(`.grid-col.active`)
        if (activeBox) {
            const cursor = activeBox.querySelector('.cursor')
            if (cursor) {
                cursor.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }, [rawText, isTypewriter, preferredLang])

    const removeTag = (index: number) => {
        setRemovingTags(prev => new Set(prev).add(index))
        setTimeout(() => {
            setTags(prev => prev.filter((_, i) => i !== index))
            setRemovingTags(prev => { const n = new Set(prev); n.delete(index); return n })
        }, 230)
    }

    const copyToClipboard = async (text: string, label: string) => {
        if (!text) return
        try {
            await navigator.clipboard.writeText(text)
            setCopyFeedback(label)
            setCopyFlash(label as "ENG" | "KOR")
            setTimeout(() => setCopyFeedback(null), 2000)
            setTimeout(() => setCopyFlash(null), 750)
        } catch (err) { console.error("Failed to copy:", err) }
    }

    const exportSession = async () => {
        try {
            const date = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
            const dateReadable = new Date().toLocaleString()
            const filePath = await save({
                filters: [{ name: "Markdown", extensions: ["md"] }],
                defaultPath: `doubletype_${date}.md`
            })
            if (!filePath) return

            // Bilingual table — align by newline
            const engLines = engOut.split("\n").filter(Boolean)
            const korLines = korOut.split("\n").filter(Boolean)
            const maxRows = Math.max(engLines.length, korLines.length, 1)
            let tableRows = "| English | Korean |\n|---|---|\n"
            for (let i = 0; i < maxRows; i++) {
                const e = (engLines[i] ?? "").replace(/\|/g, "\\|")
                const k = (korLines[i] ?? "").replace(/\|/g, "\\|")
                tableRows += `| ${e} | ${k} |\n`
            }

            const tagList = tags.length > 0 ? tags.map(t => `#${t}`).join(" ") : "(none)"
            const content = [
                `---`,
                `tool: Doubletype v1.0`,
                `date: ${dateReadable}`,
                `tags: ${tagList}`,
                `eng_words: ${engStats.words}  eng_chars: ${engStats.chars}`,
                `kor_words: ${korStats.words}  kor_chars: ${korStats.chars}`,
                `---`,
                ``,
                `# Session Export`,
                ``,
                `## Bilingual Table`,
                ``,
                tableRows,
                `## English (full)`,
                ``,
                engOut || "_(empty)_",
                ``,
                `## Korean (full)`,
                ``,
                korOut || "_(empty)_",
                ``,
                `---`,
                `*Exported by Doubletype v1.0*`,
            ].join("\n")

            await writeTextFile(filePath, content)
            setCopyFeedback("EXPORTED")
            setTimeout(() => setCopyFeedback(null), 2000)
        } catch (err) {
            console.error("Export failed:", err)
            setCopyFeedback("FAILED")
            setTimeout(() => setCopyFeedback(null), 2000)
        }
    }

    const focusAndMoveCursorToEnd = () => {
        if (inputRef.current) {
            inputRef.current.focus()
            const len = inputRef.current.value.length
            inputRef.current.setSelectionRange(len, len)
        }
    }

    const playClick = () => {
        if (isMuted) return
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)()

            // 1. The High-Freq Snap (Noise Layer)
            const bufferSize = context.sampleRate * 0.01; // 10ms burst
            const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }

            const noiseNode = context.createBufferSource();
            noiseNode.buffer = buffer;
            const noiseFilter = context.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.setValueAtTime(3500, context.currentTime);

            const noiseGain = context.createGain();
            noiseGain.gain.setValueAtTime(0.04, context.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.01);

            noiseNode.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(context.destination);

            // 2. The Body Clack (Triangle Layer)
            const osc = context.createOscillator()
            const oscGain = context.createGain()
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(280, context.currentTime) // Natural resonate freq
            osc.frequency.exponentialRampToValueAtTime(120, context.currentTime + 0.05)

            oscGain.gain.setValueAtTime(0.03, context.currentTime)
            oscGain.gain.exponentialRampToValueAtTime(0.005, context.currentTime + 0.05)

            osc.connect(oscGain)
            oscGain.connect(context.destination)

            // Fire
            noiseNode.start()
            osc.start()
            osc.stop(context.currentTime + 0.05)

            setTimeout(() => context.close(), 100)
        } catch (e) { }
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                setIsPaletteOpen(p => !p)
            }
            if (e.key === "Escape") {
                if (isPaletteOpen) {
                    setIsPaletteOpen(false)
                    focusAndMoveCursorToEnd()
                } else if (isSessionListOpen) {
                    setIsSessionListOpen(false)
                    focusAndMoveCursorToEnd()
                } else if (isHelpOpen) {
                    setIsHelpOpen(false)
                    focusAndMoveCursorToEnd()
                } else { animatedHide() }
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isPaletteOpen, isSessionListOpen, isHelpOpen])

    useEffect(() => {
        if (isPaletteOpen) paletteRef.current?.focus()
        else focusAndMoveCursorToEnd()
    }, [isPaletteOpen])

    if (!isLoaded) return null

    return (
        <main
            className={`app-container theme-${theme}${isExiting ? ' app-exiting' : ''}${isEntering ? ' app-entering' : ''}`}
            aria-label="Bilingual Doubletype Widget"
        >
            {isOnboarding && (
                <div className="boot-overlay" aria-live="polite" aria-label="Onboarding sequence">
                    <div className="boot-header" aria-hidden="true">LOG.BOOT // DOUBLETYPE v1.0.0</div>

                    {!bootStarted ? (
                        <div className="boot-lines">
                            <div className="boot-line" style={{ opacity: 0.7 }}>
                                <span className="boot-gt" aria-hidden="true">»</span>
                                {uiLang === 'ko' ? '시스템 시퀀스를 시작하려면 아무 키나 누르세요...' : 'PRESS ANY KEY TO INITIALIZE SEQUENCE...'}
                                <span className="cursor" aria-hidden="true" style={{ animationDuration: '1s' }} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="boot-lines">
                                {BOOT_LINES.slice(0, bootLine).map((line, i) => (
                                    <div key={i} className="boot-line">
                                        <span className="boot-gt" aria-hidden="true">»</span> {line}
                                    </div>
                                ))}
                                {bootLine < BOOT_LINES.length && <span className="cursor" aria-hidden="true" />}
                            </div>
                            {bootLine >= BOOT_LINES.length && (
                                <button
                                    className="boot-cta"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        stopBootCustom() // Fade out the MP3
                                        setIsOnboarding(false)
                                        localStorage.setItem("seen_onboarding", "1")
                                        setTimeout(() => inputRef.current?.focus(), 100)
                                    }}
                                    autoFocus
                                >
                                    {ui.understood}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
            <textarea
                ref={inputRef}
                value={rawText}
                onChange={(e) => {
                    setRawText(e.target.value)
                    playClick()
                }}
                autoFocus
                className="hidden-input"
                aria-label="Main hidden input for bilingual typing"
                tabIndex={0}
            />

            <div className="corner corner-tl" aria-hidden="true">┌</div>
            <div className="corner corner-tr" aria-hidden="true">┐</div>
            <div className="corner corner-bl" aria-hidden="true">└</div>
            <div className="corner corner-br" aria-hidden="true">┘</div>

            <header className="app-header" data-tauri-drag-region>
                <h1 className="visually-hidden">Doubletype Widget</h1>
                <div aria-hidden="true" data-tauri-drag-region>┤ LOG.BILINGUAL ├─ {new Date().toISOString().split('T')[0]}</div>
                <div className="status-indicator" role="status" aria-live="polite">
                    <span className={`status-dot ${isPaletteOpen ? '' : 'idle'}`} aria-hidden="true">{isPaletteOpen ? '▶' : '■'}</span>
                    {uiLang === 'ko' && <Translate size={10} style={{ opacity: 0.5, marginRight: 2 }} />}
                    <span>{isPaletteOpen ? ui.cmdMode : ui.ready}</span>
                </div>
            </header>

            <section
                className="grid-container"
                aria-label="Split text view"
                onClick={() => !isPaletteOpen && !isHelpOpen && focusAndMoveCursorToEnd()}
            >
                <article
                    className={[
                        'grid-col',
                        active === 'eng' ? 'active' : '',
                        langSwitched === 'eng' ? 'lang-switched' : '',
                        copyFlash === 'ENG' ? 'copy-flash' : ''
                    ].filter(Boolean).join(' ')}
                    aria-atomic="true" aria-live="polite"
                >
                    <div
                        className="col-header interactive"
                        onClick={() => copyToClipboard(engOut, "ENG")}
                        title="Click to copy English text"
                        role="button"
                    >
                        <span>{copyFeedback === "ENG" ? ui.copied : ui.engStrip}</span>
                        <span className="pill" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {copyFeedback === "ENG" ? null : <CopySimple size={9} weight="bold" />}
                            BUF_01
                        </span>
                    </div>
                    <span className="col-rule" aria-hidden="true">{'─'.repeat(40)}</span>
                    <div className="text-content" aria-label="English text output">
                        {engOut}{active === "eng" && <span className="cursor" aria-hidden="true" />}
                    </div>
                </article>
                <article
                    className={[
                        'grid-col',
                        active === 'kor' ? 'active' : '',
                        langSwitched === 'kor' ? 'lang-switched' : '',
                        copyFlash === 'KOR' ? 'copy-flash' : ''
                    ].filter(Boolean).join(' ')}
                    aria-atomic="true" aria-live="polite"
                >
                    <div
                        className="col-header interactive"
                        onClick={() => copyToClipboard(korOut, "KOR")}
                        title="Click to copy Korean text"
                        role="button"
                    >
                        <span>{copyFeedback === "KOR" ? ui.copied : ui.korStrip}</span>
                        <span className="pill" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {copyFeedback === "KOR" ? null : <CopySimple size={9} weight="bold" />}
                            BUF_02
                        </span>
                    </div>
                    <span className="col-rule" aria-hidden="true">{'─'.repeat(40)}</span>
                    <div className="text-content" aria-label="Korean text output">
                        {korOut}{active === "kor" && <span className="cursor" aria-hidden="true" />}
                    </div>
                </article>
            </section>

            <footer
                className="app-footer"
                onClick={() => !isPaletteOpen && !isHelpOpen && inputRef.current?.focus()}
            >
                <div className="footer-left">
                    <div className="metadata-container" aria-label={`Current metadata tags: ${tags.length > 0 ? tags.join(", ") : "None"}`}>
                        <span className="footer-label">{ui.metadata}</span>
                        {tags.length > 0 ? tags.map((t, i) => (
                            <span
                                key={i}
                                className={`tag-item interactive${removingTags.has(i) ? ' removing' : ''}`}
                                onClick={() => removeTag(i)}
                                title={uiLang === 'ko' ? '클릭하여 태그 삭제' : 'Click to remove tag'}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === "Enter" && removeTag(i)}
                            >
                                #{t}
                            </span>
                        )) : <span className="empty-state">{ui.noTags}</span>}
                    </div>
                    <div className="footer-stats">
                        <span className={`stat-unit ${isTypewriter ? 'active' : ''}`} title="Typewriter Mode" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {isTypewriter
                                ? <><ArrowsInLineVertical size={11} weight="bold" />{ui.typeCenter}</>
                                : <><TextAlignCenter size={11} />{ui.normScroll}</>}
                        </span>
                        <span className="stat-sep">·</span>
                        <span className={`stat-unit ${!isMuted ? 'active' : ''}`} title="Mute/Unmute" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {isMuted
                                ? <><SpeakerSimpleX size={11} weight="bold" />{ui.mute}</>
                                : <><SpeakerSimpleHigh size={11} weight="bold" />{ui.click}</>}
                        </span>
                        <span className="stat-sep">·</span>
                        ENG: {engStats.words}{ui.engWord} / {engStats.chars}{ui.engChar}
                        <span className="stat-sep">|</span>
                        KOR: {korStats.words}{ui.engWord} / {korStats.chars}{ui.engChar}
                    </div>
                </div>
                <span className="footer-shortcut" aria-label="Press Command and K to open menu" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Command size={10} weight="bold" />
                    K // {uiLang === 'ko' ? '메뉴' : 'MENU'}
                </span>
            </footer>

            {isPaletteOpen && (
                <div className="palette-overlay" role="dialog" aria-modal="true" aria-label="Command Palette">
                    <div className="palette-box">
                        <span className="palette-prompt" aria-hidden="true">~ $</span>
                        <input
                            ref={paletteRef}
                            value={paletteInput}
                            onChange={(e) => setPaletteInput(e.target.value)}
                            onKeyDown={(e) => {
                                e.stopPropagation()
                                if (e.key === "Enter") {
                                    const val = paletteInput.trim().toLowerCase()
                                    // Two-step confirmation for destructive commands
                                    if (confirmPending === "clear" && (val === ":clear" || val === ":지우기")) {
                                        setRawText("")
                                        setTags([])
                                        setConfirmPending(null)
                                        setIsPaletteOpen(false)
                                    } else if (confirmPending === "reset" && (val === ":reset" || val === ":초기화")) {
                                        localStorage.clear()
                                        window.location.reload()
                                    } else if (val === ":clear" || val === ":지우기") {
                                        setConfirmPending("clear")
                                        setPaletteInput(uiLang === 'ko' ? ':지우기' : ':clear')
                                        return
                                    } else if (val === ":reset" || val === ":초기화") {
                                        setConfirmPending("reset")
                                        setPaletteInput(uiLang === 'ko' ? ':초기화' : ':reset')
                                        return
                                    } else if (val === ":help" || val === ":도움말") {
                                        setIsHelpOpen(true)
                                        setIsPaletteOpen(false)
                                    } else if (val === ":mute" || val === ":음소거") {
                                        setIsMuted(true)
                                        localStorage.setItem("scratch_muted", "true")
                                        setIsPaletteOpen(false)
                                    } else if (val === ":unmute" || val === ":음소거해제") {
                                        setIsMuted(false)
                                        localStorage.setItem("scratch_muted", "false")
                                        setIsPaletteOpen(false)
                                    } else if (val === ":lang ko" || val === ":언어 한국어") {
                                        setUiLang("ko")
                                        localStorage.setItem("scratch_uilang", "ko")
                                        setIsPaletteOpen(false)
                                    } else if (val === ":lang en" || val === ":언어 영어") {
                                        setUiLang("en")
                                        localStorage.setItem("scratch_uilang", "en")
                                        setIsPaletteOpen(false)
                                    } else if (val === ":export" || val === ":내보내기") {
                                        exportSession()
                                        setIsPaletteOpen(false)
                                    } else if (val === ":typewriter" || val === ":타이프라이터") {
                                        setIsTypewriter(prev => !prev)
                                        setIsPaletteOpen(false)
                                    } else if ([":amber", ":green", ":cyan", ":default", ":lime"].includes(val)) {
                                        const newTheme = val.replace(":", "")
                                        setTheme(newTheme)
                                        localStorage.setItem("scratch_theme", newTheme)
                                        setIsPaletteOpen(false)
                                    } else if (val === ":list" || val === ":목록") {
                                        setIsSessionListOpen(true)
                                        setIsPaletteOpen(false)
                                    } else if (val.startsWith(":save ") || val.startsWith(":저장 ")) {
                                        const name = val.replace(/^:(save|저장)\s+/, "").trim()
                                        if (name) {
                                            if (sessions[name]) {
                                                setConfirmPending(`save [${name}]`)
                                                setPaletteInput("")
                                                return
                                            }
                                            const newSessions = { ...sessions, [name]: { text: rawText, tags: [...tags], lastModified: Date.now() } }
                                            setSessions(newSessions)
                                            localStorage.setItem("scratch_sessions", JSON.stringify(newSessions))
                                            setIsPaletteOpen(false)
                                        }
                                    } else if (val.startsWith(":load ") || val.startsWith(":불러오기 ")) {
                                        const name = val.replace(/^:(load|불러오기)\s+/, "").trim()
                                        if (name && sessions[name]) {
                                            const session = sessions[name]
                                            setRawText(session.text)
                                            setTags(session.tags)
                                            localStorage.setItem("scratch_text", session.text)
                                            localStorage.setItem("scratch_tags", JSON.stringify(session.tags))
                                            setIsPaletteOpen(false)
                                        }
                                    } else if (val.startsWith(":delete ") || val.startsWith(":삭제 ")) {
                                        const name = val.replace(/^:(delete|삭제)\s+/, "").trim()
                                        if (name && sessions[name]) {
                                            setConfirmPending(`delete [${name}]`)
                                            setPaletteInput("")
                                            return
                                        }
                                    } else {
                                        if (confirmPending === "clear") {
                                            setRawText("")
                                            setTags([])
                                            localStorage.removeItem("scratch_text")
                                            localStorage.removeItem("scratch_tags")
                                        } else if (confirmPending === "reset") {
                                            const currentLang = uiLang;
                                            localStorage.clear()
                                            localStorage.setItem("scratch_uilang", currentLang)

                                            setRawText("")
                                            setTags([])
                                            setTheme("default")
                                            setIsMuted(false)
                                            setIsOnboarding(true)
                                            setBootStarted(false)
                                            setBootLine(0)
                                            bootSoundPlayedRef.current = false
                                        } else if (confirmPending?.startsWith("save [")) {
                                            const name = confirmPending.slice(6, -1)
                                            const newSessions = { ...sessions, [name]: { text: rawText, tags: [...tags], lastModified: Date.now() } }
                                            setSessions(newSessions)
                                            localStorage.setItem("scratch_sessions", JSON.stringify(newSessions))
                                        } else if (confirmPending?.startsWith("delete [")) {
                                            const name = confirmPending.slice(8, -1)
                                            const newSessions = { ...sessions }
                                            delete newSessions[name]
                                            setSessions(newSessions)
                                            localStorage.setItem("scratch_sessions", JSON.stringify(newSessions))
                                        } else if (val.length > 0) {
                                            const tag = val.replace(/^\//, "").trim()
                                            if (tag.length > 0) setTags(prev => [...prev, tag])
                                        }
                                        setConfirmPending(null)
                                        setIsPaletteOpen(false)
                                        setPaletteInput("")
                                    }
                                }
                                if (e.key === "Escape") {
                                    setConfirmPending(null)
                                    setIsPaletteOpen(false)
                                    setPaletteInput("")
                                }
                            }}
                            className="palette-input"
                            placeholder={confirmPending
                                ? (uiLang === 'ko'
                                    ? `⚠ 확인: Enter를 다시 눌러 ${confirmPending}을(를) 승인하세요`
                                    : `⚠ Confirm: press Enter again to ${confirmPending}`)
                                : ui.placeholder}
                            aria-label="Command palette input field"
                        />
                    </div>
                </div>
            )}
            {isSessionListOpen && (
                <div className="help-overlay" onClick={() => setIsSessionListOpen(false)} role="dialog" aria-label="Session list">
                    <div className="help-box" onClick={e => e.stopPropagation()}>
                        <div className="help-header">┌─[ LOG.SESSIONS // {ui.help.list} ]</div>
                        <div className="help-content session-list-content">
                            {Object.entries(sessions).length === 0 ? (
                                <div className="help-row"><span className="help-desc">00_SESSIONS_FOUND</span></div>
                            ) : (
                                Object.entries(sessions).map(([name, session]) => (
                                    <div
                                        key={name}
                                        className="help-row session-list-item"
                                        onClick={() => {
                                            setRawText(session.text)
                                            setTags(session.tags)
                                            localStorage.setItem("scratch_text", session.text)
                                            localStorage.setItem("scratch_tags", JSON.stringify(session.tags))
                                            setIsSessionListOpen(false)
                                        }}
                                        style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
                                    >
                                        <span>[ {name} ]</span>
                                        <span className="help-desc">│ {new Date(session.lastModified).toLocaleDateString()} │ {session.tags.length} TAGS</span>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="help-footer">
                            <button className="help-close" onClick={() => setIsSessionListOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                └─ {ui.close}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isHelpOpen && (
                <div className="help-overlay" onClick={() => setIsHelpOpen(false)} role="dialog" aria-label="Instruction list">
                    <div className="help-box" onClick={e => e.stopPropagation()}>
                        <div className="help-header">┌─[ {ui.helpTitle} ]</div>
                        <div className="help-content">
                            <div className="help-row"><span>{ui.cmds.help}</span> <span className="help-desc">│ {ui.help.help}</span></div>
                            <div className="help-row"><span>{ui.cmds.export}</span> <span className="help-desc">│ {ui.help.export}</span></div>
                            <div className="help-row"><span>{ui.cmds.typewriter}</span> <span className="help-desc">│ {ui.help.typewriter}</span></div>
                            <div className="help-row"><span>{ui.cmds.mute}</span> <span className="help-desc">│ {ui.help.mute}</span></div>
                            <div className="help-row"><span>{ui.cmds.lang}</span> <span className="help-desc">│ {ui.help.lang}</span></div>
                            <div className="help-row"><span>:amber|green|cyan|default</span> <span className="help-desc">│ {ui.help.themes}</span></div>
                            <div className="help-row"><span>{ui.cmds.tag}</span> <span className="help-desc">│ {ui.help.tag}</span></div>
                            <div className="help-row"><span>{ui.cmds.save}</span> <span className="help-desc">│ {ui.help.save}</span></div>
                            <div className="help-row"><span>{ui.cmds.load}</span> <span className="help-desc">│ {ui.help.load}</span></div>
                            <div className="help-row"><span>{ui.cmds.list}</span> <span className="help-desc">│ {ui.help.list}</span></div>
                            <div className="help-row help-row-danger"><span>{ui.cmds.delete}</span> <span className="help-desc">│ {ui.help.delete}</span></div>

                            <div className="help-row"><span>{ui.keys.cmdK}</span> <span className="help-desc">│ {ui.help.cmdK}</span></div>
                            <div className="help-row"><span>{ui.keys.esc}</span> <span className="help-desc">│ {ui.help.esc}</span></div>
                            <div className="help-row"><span>{ui.keys.clickTag}</span> <span className="help-desc">│ {ui.help.clickTag}</span></div>
                            <div className="help-row"><span>{ui.keys.clickHeader}</span> <span className="help-desc">│ {ui.help.clickHeader}</span></div>
                            <div className="help-row help-row-danger"><span>{ui.cmds.clear}</span> <span className="help-desc">│ {ui.help.clear}</span></div>
                            <div className="help-row help-row-danger"><span>{ui.cmds.reset}</span> <span className="help-desc">│ {ui.help.reset}</span></div>
                        </div>
                        <div className="help-footer">
                            <button className="help-close" onClick={() => setIsHelpOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                └─ {ui.close}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="scanlines" aria-hidden="true" />
        </main>
    )
}