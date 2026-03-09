import { useState, useEffect, useRef } from "react"
import { register, unregister } from "@tauri-apps/plugin-global-shortcut"
import { getCurrentWindow } from "@tauri-apps/api/window"
import "./App.css"

export default function App() {
    const [rawText, setRawText] = useState("")
    const [isLoaded, setIsLoaded] = useState(false)
    const [isPaletteOpen, setIsPaletteOpen] = useState(false)
    const [paletteInput, setPaletteInput] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [isOnboarding, setIsOnboarding] = useState(false)
    const [bootLine, setBootLine] = useState(0)
    const [isHelpOpen, setIsHelpOpen] = useState(false)
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
    const [preferredLang, setPreferredLang] = useState<"eng" | "kor">(
        navigator.language.startsWith("ko") ? "kor" : "eng"
    )

    const inputRef = useRef<HTMLTextAreaElement>(null)
    const paletteRef = useRef<HTMLInputElement>(null)

    // Use a ref to track palette state inside the shortcut closure
    // without triggering a re-registration of the OS-level hook
    const isPaletteOpenRef = useRef(isPaletteOpen);
    useEffect(() => {
        isPaletteOpenRef.current = isPaletteOpen;
    }, [isPaletteOpen]);

    // Logic for the Bilingual Engine
    const parseText = (text: string) => {
        const eng = text.match(/[a-zA-Z0-9\s\.,!?@#\$%\^&\*\(\)\-_=\+\[\]\{\}\\|;:'"<>\/`~]+/g)
        const kor = text.match(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\s\.,!?]+/g)
        return {
            engOut: eng ? eng.join("").trim() : "",
            korOut: kor ? kor.join("").trim() : ""
        }
    }
    const { engOut, korOut } = parseText(rawText)

    useEffect(() => {
        const lastChar = rawText.trimEnd().slice(-1)
        if (lastChar) {
            const isK = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(lastChar)
            const isE = /[a-zA-Z0-9]/.test(lastChar)
            if (isK) setPreferredLang("kor")
            else if (isE) setPreferredLang("eng")
        }
    }, [rawText])

    const active = preferredLang

    useEffect(() => {
        const SHORTCUT = "CommandOrControl+Shift+X"

        const setup = async () => {
            try {
                // Ensure any dangling registration is cleared before registering
                await unregister(SHORTCUT).catch(() => { })
                await register(SHORTCUT, async (event) => {
                    if (event.state === "Pressed") {
                        const appWindow = getCurrentWindow()
                        const isVisible = await appWindow.isVisible()
                        if (isVisible) await appWindow.hide()
                        else {
                            await appWindow.show()
                            await appWindow.setFocus()
                            setTimeout(() => inputRef.current?.focus(), 50)
                        }
                    }
                })
            } catch (e) { console.error("Global shortcut registration failed:", e) }
        }
        setup()

        return () => {
            unregister(SHORTCUT).catch(() => { })
        }
    }, []) // Empty dependency array: register once on mount

    // Data persistence + first-launch onboarding
    useEffect(() => {
        const savedData = localStorage.getItem("scratch_text")
        const savedTags = localStorage.getItem("scratch_tags")
        if (savedData) setRawText(savedData)
        if (savedTags) setTags(JSON.parse(savedTags))
        setIsLoaded(true)

        if (!localStorage.getItem("seen_onboarding")) {
            setIsOnboarding(true)
        }
    }, [])

    // Boot sequence: reveal lines one by one, then exit
    const BOOT_LINES = [
        "BILINGUAL ENGINE LOADED.",
        "TYPE ANYTHING. ENG AND KOR SPLIT AUTOMATICALLY.",
        "CMD+K TO TAG. ESC TO DISMISS.",
        "CLICK HEADERS TO COPY BUFFERS.",
        "INITIALIZING SCRATCHPAD...",
    ]
    useEffect(() => {
        if (!isOnboarding) return
        if (bootLine < BOOT_LINES.length) {
            const t = setTimeout(() => setBootLine(b => b + 1), 900)
            return () => clearTimeout(t)
        }
        // Lines are done — wait for user to click the CTA
    }, [isOnboarding, bootLine])

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("scratch_text", rawText)
            localStorage.setItem("scratch_tags", JSON.stringify(tags))
        }
    }, [rawText, tags, isLoaded])

    const removeTag = (index: number) => {
        setTags(prev => prev.filter((_, i) => i !== index))
    }

    const copyToClipboard = async (text: string, label: string) => {
        if (!text) return
        try {
            await navigator.clipboard.writeText(text)
            setCopyFeedback(label)
            setTimeout(() => setCopyFeedback(null), 2000)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    // Command Palette & Global Keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                setIsPaletteOpen(p => !p)
            }
            if (e.key === "Escape") {
                if (isPaletteOpen) {
                    setIsPaletteOpen(false)
                    inputRef.current?.focus()
                } else {
                    getCurrentWindow().hide()
                }
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isPaletteOpen])

    useEffect(() => {
        if (isPaletteOpen) paletteRef.current?.focus()
        else inputRef.current?.focus()
    }, [isPaletteOpen])

    if (!isLoaded) return null

    return (
        <main className="app-container" aria-label="Bilingual Scratchpad Widget">

            {/* Boot Sequence Onboarding Overlay */}
            {isOnboarding && (
                <div className="boot-overlay" aria-live="polite" aria-label="Onboarding sequence">
                    <div className="boot-header" aria-hidden="true">LOG.BOOT // SPICY-SCRATCHPAD v0.1</div>
                    <div className="boot-lines">
                        {BOOT_LINES.slice(0, bootLine).map((line, i) => (
                            <div key={i} className="boot-line">
                                <span className="boot-gt" aria-hidden="true">&gt;</span> {line}
                            </div>
                        ))}
                        {bootLine < BOOT_LINES.length && <span className="cursor" aria-hidden="true" />}
                    </div>
                    {bootLine >= BOOT_LINES.length && (
                        <button
                            className="boot-cta"
                            onClick={() => {
                                setIsOnboarding(false)
                                localStorage.setItem("seen_onboarding", "1")
                            }}
                            autoFocus
                        >
                            // UNDERSTOOD.
                        </button>
                    )}
                </div>
            )}
            <textarea
                ref={inputRef}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                autoFocus
                className="hidden-input"
                aria-label="Main hidden input for bilingual typing"
                tabIndex={0}
            />

            {/* ASCII Corners (Hidden from screen readers) */}
            <div className="corner corner-tl" aria-hidden="true">+</div>
            <div className="corner corner-tr" aria-hidden="true">+</div>
            <div className="corner corner-bl" aria-hidden="true">+</div>
            <div className="corner corner-br" aria-hidden="true">+</div>

            <header className="app-header" data-tauri-drag-region>
                <h1 className="visually-hidden">Spicy Scratchpad Widget</h1>
                <div aria-hidden="true" data-tauri-drag-region>LOG.BILINGUAL // {new Date().toISOString().split('T')[0]}</div>
                <div className="status-indicator" role="status" aria-live="polite">
                    <span className={`status-dot ${isPaletteOpen ? '' : 'idle'}`} aria-hidden="true"></span>
                    <span>{isPaletteOpen ? "Command Mode" : "Ready"}</span>
                </div>
            </header>

            <section
                className="grid-container"
                aria-label="Split text view"
                onClick={() => !isPaletteOpen && !isHelpOpen && inputRef.current?.focus()}
            >
                <article className={`grid-col ${active === "eng" ? "active" : ""}`} aria-atomic="true" aria-live="polite">
                    <div
                        className="col-header interactive"
                        onClick={() => copyToClipboard(engOut, "ENG")}
                        title="Click to copy English text"
                        role="button"
                    >
                        <span>{copyFeedback === "ENG" ? "// COPIED" : "ENG.STRIP"}</span>
                        <span className="pill">BUF_01</span>
                    </div>
                    <div className="text-content" aria-label="English text output">
                        {engOut}{active === "eng" && <span className="cursor" aria-hidden="true" />}
                    </div>
                </article>
                <article className={`grid-col ${active === "kor" ? "active" : ""}`} aria-atomic="true" aria-live="polite">
                    <div
                        className="col-header interactive"
                        onClick={() => copyToClipboard(korOut, "KOR")}
                        title="Click to copy Korean text"
                        role="button"
                    >
                        <span>{copyFeedback === "KOR" ? "// COPIED" : "KOR.STRIP"}</span>
                        <span className="pill">BUF_02</span>
                    </div>
                    <div className="text-content" aria-label="Korean text output">
                        {korOut}{active === "kor" && <span className="cursor" aria-hidden="true" />}
                    </div>
                </article>
            </section>

            <footer
                className="app-footer"
                onClick={() => !isPaletteOpen && !isHelpOpen && inputRef.current?.focus()}
            >
                <span className="metadata-container" aria-label={`Current metadata tags: ${tags.length > 0 ? tags.join(", ") : "None"}`}>
                    METADATA: {tags.length > 0 ? tags.map((t, i) => (
                        <span
                            key={i}
                            className="tag-item interactive"
                            onClick={() => removeTag(i)}
                            title="Click to remove tag"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && removeTag(i)}
                        >
                            #{t}
                        </span>
                    )) : <span className="empty-state">00_TAGS</span>}
                </span>
                <span className="footer-shortcut" aria-label="Press Command and K to open menu">CMD+K // MENU</span>
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
                                    if (val === ":clear") {
                                        setRawText("")
                                        setTags([])
                                        setIsPaletteOpen(false)
                                    } else if (val === ":help") {
                                        setIsHelpOpen(true)
                                        setIsPaletteOpen(false)
                                    } else if (val.length > 0) {
                                        // Accept both "/tag" and "tag" formats
                                        const tag = val.replace(/^\//, "").trim()
                                        if (tag.length > 0) {
                                            setTags(prev => [...prev, tag])
                                        }
                                        setIsPaletteOpen(false)
                                    } else {
                                        setIsPaletteOpen(false)
                                    }
                                    setPaletteInput("")
                                }
                                if (e.key === "Escape") {
                                    setIsPaletteOpen(false)
                                    setPaletteInput("")
                                }
                            }}
                            className="palette-input"
                            placeholder=":clear or tag name..."
                            aria-label="Command palette input field"
                        />
                    </div>
                </div>
            )}
            {isHelpOpen && (
                <div className="help-overlay" onClick={() => setIsHelpOpen(false)} role="dialog" aria-label="Instruction list">
                    <div className="help-box" onClick={e => e.stopPropagation()}>
                        <div className="help-header">SYSTEM.HELP // AVAILABLE_COMMANDS</div>
                        <div className="help-content">
                            <div className="help-row"><span>:clear</span> <span className="help-desc">WIPE ALL DATA + TAGS</span></div>
                            <div className="help-row"><span>:help</span> <span className="help-desc">SHOW THIS MENU</span></div>
                            <div className="help-row"><span>[tag]</span> <span className="help-desc">ADD NEW METADATA TAG</span></div>
                            <div className="help-row"><span>/tag</span> <span className="help-desc">ADD NEW METADATA TAG</span></div>
                            <div className="help-row"><span>CMD+K</span> <span className="help-desc">OPEN COMMAND PALETTE</span></div>
                            <div className="help-row"><span>ESC</span> <span className="help-desc">HIDE APP / DISMISS MENU</span></div>
                            <div className="help-row"><span>CLICK TAG</span> <span className="help-desc">DELETE INDIVIDUAL TAG</span></div>
                            <div className="help-row"><span>CLICK HEADER</span> <span className="help-desc">COPY COLUMN TO CLIPBOARD</span></div>
                        </div>
                        <button className="help-close" onClick={() => setIsHelpOpen(false)}>// CLOSE.</button>
                    </div>
                </div>
            )}
            <div className="scanlines" aria-hidden="true" />
        </main>
    )
}