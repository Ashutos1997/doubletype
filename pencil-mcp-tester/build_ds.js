import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import process from 'node:process';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';

const transport = new StdioClientTransport({
    command: "/Applications/Pencil.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64",
    args: ["--app", "desktop"],
    env: process.env
});

const client = new Client({
    name: "pencil-mcp-tester",
    version: "1.0.0"
}, {
    capabilities: { prompts: {}, resources: {}, tools: {} }
});

const doubletypeVars = {
    "bg-base": "#000000",
    "bg-surface-1": "#0A0A0A",
    "bg-surface-2": "#111111",
    "bg-surface-hover": "#1A1A1A",
    "border-subtle": "#222222",
    "border-default": "#333333",
    "border-strong": "#555555",
    "border-accent": "#D4FF00",
    "text-primary": "#FFFFFF",
    "text-secondary": "#AAAAAA",
    "text-tertiary": "#666666",
    "text-accent": "#D4FF00",
    "text-inverse": "#000000",
    "signal-success": "#39FF14",
    "signal-warning": "#FFB000",
    "signal-critical": "#FF003C",
    "signal-info": "#00E5FF",
    "font-mono": "'JetBrains Mono', monospace",
    "font-sans": "'Inter', sans-serif"
};

const doubletypeTokensFormat = Object.fromEntries(
    Object.entries(doubletypeVars).map(([k, v]) => [k, { type: k.includes("font") ? "string" : "color", value: v }])
);

async function main() {
    await client.connect(transport);

    console.log("Checking editor state...");
    try {
        await client.callTool({ name: "get_editor_state", arguments: { include_schema: false } });
    } catch (e) {
        console.log("No active editor, opening new document...");
        const openRes = await client.callTool({
            name: "open_document",
            arguments: { filePathOrTemplate: 'new' }
        });
        console.log("Waiting 2s for runtime to initialize...");
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log("Setting variables...");
    try {
        const varRes = await client.callTool({
            name: "set_variables",
            arguments: {
                variables: doubletypeTokensFormat
            }
        });
        console.log("Variables set:");
    } catch (err) {
        console.error("Failed setting variables via {default: v}, trying plain values...", err.message);
        const varRes2 = await client.callTool({
            name: "set_variables",
            arguments: { variables: doubletypeVars }
        });
        console.log("Variables set with plain values");
    }

    // Create Sticker Sheet with explicit HEX codes to fix rendering
    const commands = [
        `screen=I(document, {type: "frame", name: "Doubletype DS", layout: "vertical", fill: "#000000", width: 1440, height: "fit_content(1024)", padding: 64, gap: 48})`,

        // Header
        `header=I(screen, {type: "frame", layout: "vertical", width: "fill_container", gap: 16})`,
        `title=I(header, {type: "text", content: "DOUBLETYPE DESIGN SYSTEM", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 48, fontWeight: "bold"})`,
        `subtitle=I(header, {type: "text", content: "Comprehensive UI/UX Specification Document v1.0", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 16})`,

        // Color Palette Section
        `colorSection=I(screen, {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `colorTitle=I(colorSection, {type: "text", content: "1. Colors", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,

        `surfRow=I(colorSection, {type: "frame", layout: "horizontal", gap: 16, width: "fill_container"})`,
        `s1=I(surfRow, {type: "frame", layout: "vertical", width: 160, height: 160, fill: "#000000", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, cornerRadius: [0,0,0,0], padding: 16, justifyContent: "end"})`,
        `s1t=I(s1, {type: "text", content: "bg-base", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`,

        `s2=I(surfRow, {type: "frame", layout: "vertical", width: 160, height: 160, fill: "#0A0A0A", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, padding: 16, justifyContent: "end"})`,
        `s2t=I(s2, {type: "text", content: "bg-surface-1", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`,

        `s3=I(surfRow, {type: "frame", layout: "vertical", width: 160, height: 160, fill: "#111111", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, padding: 16, justifyContent: "end"})`,
        `s3t=I(s3, {type: "text", content: "bg-surface-2", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`,

        // Primary Button
        `btnSection=I(screen, {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `btnTitle=I(btnSection, {type: "text", content: "2. Atomic Components", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,

        `btnRow=I(btnSection, {type: "frame", layout: "horizontal", gap: 16, width: "fill_container", alignItems: "center"})`,
        `btn1=I(btnRow, {type: "frame", layout: "horizontal", padding: [12, 24], fill: "#D4FF00", cornerRadius: [4,4,4,4]})`,
        `btn1t=I(btn1, {type: "text", content: "PRIMARY SYSTEM", fill: "#000000", fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: "bold"})`,

        // Input Field
        `input1=I(btnRow, {type: "frame", layout: "horizontal", padding: [12, 12], fill: "#000000", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, cornerRadius: [4,4,4,4], width: 300})`,
        `input1t=I(input1, {type: "text", content: "_cursor", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`,

        // Test Card
        `card=I(screen, {type: "frame", layout: "vertical", width: 400, fill: "#0A0A0A", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#222222"}, padding: 24, gap: 16})`,
        `cardTitle=I(card, {type: "text", content: "SYSTEM LOG", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontWeight: "bold", fontSize: 16})`,
        `cardDesc=I(card, {type: "text", content: "Initialization sequence complete. All subroutines nominal.", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`
    ];

    console.log("Running batch_design...");
    try {
        const designRes = await client.callTool({
            name: "batch_design",
            arguments: {
                operations: commands.join("\n")
            }
        });
        console.log("batch_design response:", designRes.content?.[0]?.text || "Success");
    } catch (e) {
        console.error("batch_design failed:", e.message);
    }

    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
