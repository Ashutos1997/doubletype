import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import process from 'node:process';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
    command: "/Applications/Pencil.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64",
    args: ["--app", "desktop"],
    env: process.env
});

const client = new Client({ name: "pencil-fix", version: "1" }, { capabilities: { tools: {} } });

async function main() {
    await client.connect(transport);

    // Find current elements
    const searchRes = await client.callTool({
        name: "batch_get",
        arguments: { patterns: [{ name: "Doubletype DS" }] }
    });

    const nodes = JSON.parse(searchRes.content[0].text);
    console.log("Found nodes to delete:", nodes.length);

    const commands = [];
    for (const node of nodes) {
        if (node.id) commands.push(`D("${node.id}")`);
    }

    if (commands.length > 0) {
        await client.callTool({
            name: "batch_design",
            arguments: { operations: commands.join("\n") }
        });
        console.log("Deleted old frames.");
    }

    // Create Sticker Sheet with explicit HEX codes to fix rendering
    const fixedCommands = [
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

        // Typography Section
        `typoSection=I(screen, {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `typoTitle=I(typoSection, {type: "text", content: "2. Typography (JetBrains Mono)", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,

        `displayTypo=I(typoSection, {type: "text", content: "Display - 48px", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 48, fontWeight: "bold"})`,
        `xlTypo=I(typoSection, {type: "text", content: "Text XL - 24px", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,
        `lgTypo=I(typoSection, {type: "text", content: "Text LG - 20px", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 20})`,
        `baseTypo=I(typoSection, {type: "text", content: "Text Base - 16px. Used for most body copy. The quick brown fox jumps.", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 16})`,
        `smTypo=I(typoSection, {type: "text", content: "Text SM - 14px. Used for buttons and secondary copy.", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `xsTypo=I(typoSection, {type: "text", content: "TEXT XS - 12PX. USED FOR LABELS.", fill: "#666666", fontFamily: "JetBrains Mono", fontSize: 12})`,

        // Spacing Section
        `spaceSection=I(screen, {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `spaceTitle=I(spaceSection, {type: "text", content: "3. Spacing System (4px Grid)", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,

        `spaceRow=I(spaceSection, {type: "frame", layout: "horizontal", gap: 24, width: "fill_container", alignItems: "end"})`,
        `sp4=I(spaceRow, {type: "frame", layout: "vertical", width: 4, height: 40, fill: "#D4FF00"})`,
        `sp8=I(spaceRow, {type: "frame", layout: "vertical", width: 8, height: 40, fill: "#D4FF00"})`,
        `sp12=I(spaceRow, {type: "frame", layout: "vertical", width: 12, height: 40, fill: "#D4FF00"})`,
        `sp16=I(spaceRow, {type: "frame", layout: "vertical", width: 16, height: 40, fill: "#D4FF00"})`,
        `sp24=I(spaceRow, {type: "frame", layout: "vertical", width: 24, height: 40, fill: "#D4FF00"})`,
        `sp32=I(spaceRow, {type: "frame", layout: "vertical", width: 32, height: 40, fill: "#D4FF00"})`,
        `sp48=I(spaceRow, {type: "frame", layout: "vertical", width: 48, height: 40, fill: "#D4FF00"})`,
        `sp64=I(spaceRow, {type: "frame", layout: "vertical", width: 64, height: 40, fill: "#D4FF00"})`,

        // Components Section
        `btnSection=I(screen, {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `btnSectionTitle=I(btnSection, {type: "text", content: "4. Components & Feedback", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,

        `btnRow=I(btnSection, {type: "frame", layout: "horizontal", gap: 16, width: "fill_container", alignItems: "center"})`,
        `btn1=I(btnRow, {type: "frame", layout: "horizontal", padding: [12, 24], fill: "#D4FF00", cornerRadius: [4,4,4,4]})`,
        `btn1t=I(btn1, {type: "text", content: "PRIMARY", fill: "#000000", fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: "bold"})`,

        `btn2=I(btnRow, {type: "frame", layout: "horizontal", padding: [12, 24], fill: "#111111", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, cornerRadius: [4,4,4,4]})`,
        `btn2t=I(btn2, {type: "text", content: "SECONDARY", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: "bold"})`,

        // Form
        `formRow=I(btnSection, {type: "frame", layout: "horizontal", gap: 16, width: "fill_container", alignItems: "end"})`,
        `inputCol=I(formRow, {type: "frame", layout: "vertical", gap: 8})`,
        `inputLabel=I(inputCol, {type: "text", content: "SYSTEM ID", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 12})`,
        `input1=I(inputCol, {type: "frame", layout: "horizontal", padding: [12, 12], fill: "#000000", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, cornerRadius: [4,4,4,4], width: 300})`,
        `input1t=I(input1, {type: "text", content: "_cursor", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`,

        // Badges / Tags
        `tagRow=I(btnSection, {type: "frame", layout: "horizontal", gap: 12, width: "fill_container", alignItems: "center"})`,
        `tagNeutral=I(tagRow, {type: "frame", layout: "horizontal", padding: [4, 8], fill: "#111111", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, cornerRadius: [2,2,2,2]})`,
        `tagNeutralT=I(tagNeutral, {type: "text", content: "NEUTRAL", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 12})`,

        `tagSuccess=I(tagRow, {type: "frame", layout: "horizontal", padding: [4, 8], stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#39FF14"}, cornerRadius: [2,2,2,2]})`,
        `tagSuccessT=I(tagSuccess, {type: "text", content: "NOMINAL", fill: "#39FF14", fontFamily: "JetBrains Mono", fontSize: 12})`,

        `tagAlert=I(tagRow, {type: "frame", layout: "horizontal", padding: [4, 8], stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#FF003C"}, cornerRadius: [2,2,2,2]})`,
        `tagAlertT=I(tagAlert, {type: "text", content: "CRITICAL", fill: "#FF003C", fontFamily: "JetBrains Mono", fontSize: 12})`
    ];

    console.log("Running batch_design with fixed hex codes...");
    const designRes = await client.callTool({
        name: "batch_design",
        arguments: { operations: fixedCommands.join("\n") }
    });
    console.log("Success generated.");

    process.exit(0);
}

main().catch(console.error);
