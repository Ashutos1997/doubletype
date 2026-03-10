import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import process from 'node:process';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
    command: "/Applications/Pencil.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64",
    args: ["--app", "desktop"],
    env: process.env
});

const client = new Client({ name: "pencil-mui", version: "1" }, { capabilities: { tools: {} } });

async function main() {
    await client.connect(transport);

    console.log("Checking editor state...");
    try {
        await client.callTool({ name: "get_editor_state", arguments: { include_schema: false } });
    } catch (e) {
        console.log("No active editor, opening new document...");
        await client.callTool({ name: "open_document", arguments: { filePathOrTemplate: 'new' } });
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Clear previous nodes to start fresh
    try {
        const searchRes = await client.callTool({
            name: "batch_get",
            arguments: { patterns: [{ name: "Doubletype MUI UIKit" }, { name: "Doubletype DS" }] }
        });
        const nodes = JSON.parse(searchRes.content[0].text);
        if (nodes.length > 0) {
            const delOps = nodes.filter(n => n.id).map(n => `D("${n.id}")`);
            if (delOps.length > 0) {
                await client.callTool({ name: "batch_design", arguments: { operations: delOps.join("\\n") } });
                console.log("Deleted old frames.");
            }
        }
    } catch (e) { }

    // We will divide the UI kit into multiple batch commands to avoid operation limits

    // CHUNK 1: Structure & Intro
    const chunk1 = [
        `screen=I(document, {type: "frame", name: "Doubletype MUI UIKit", layout: "vertical", fill: "#000000", width: 1440, height: "fit_content(2000)", padding: 64, gap: 64})`,

        // Header
        `header=I(screen, {type: "frame", layout: "vertical", width: "fill_container", gap: 16})`,
        `title=I(header, {type: "text", content: "DOUBLETYPE UI KIT", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 48, fontWeight: "bold"})`,
        `subtitle=I(header, {type: "text", content: "Extensive Component System v2.0", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 16})`,

        // 5. Layouts Section
        `layoutSection=I(screen, {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `layoutTitle=I(layoutSection, {type: "text", content: "5. Structural Layouts", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,

        // Topbar
        `topbarTitle=I(layoutSection, {type: "text", content: "Topbar (64px Height)", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `topbar=I(layoutSection, {type: "frame", layout: "horizontal", width: "fill_container", height: 64, fill: "#050505", stroke: {thickness: {bottom:1}, fill: "#222222"}, padding: [0, 24], alignItems: "center", justifyContent: "space_between"})`,
        `brand=I(topbar, {type: "text", content: "DOUBLETYPE_OP", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 16, fontWeight: "bold"})`,
        `topNav=I(topbar, {type: "frame", layout: "horizontal", gap: 24})`,
        `nav1=I(topNav, {type: "text", content: "ENGINES", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 12})`,
        `nav2=I(topNav, {type: "text", content: "SYSTEM LOGS", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 12})`,
        `userProfile=I(topbar, {type: "frame", padding: 8, stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, cornerRadius: 50})`,
        `userDot=I(userProfile, {type: "frame", width: 16, height: 16, fill: "#111111", cornerRadius: 50})`,

        // Sidebar
        `sidebarTitle=I(layoutSection, {type: "text", content: "Sidebar (240px Width)", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `sidebar=I(layoutSection, {type: "frame", layout: "vertical", width: 240, height: 300, fill: "#000000", stroke: {thickness: {right:1}, fill: "#222222"}, padding: [16, 0], gap: 8})`,
        `sideLinkActive=I(sidebar, {type: "frame", layout: "horizontal", width: "fill_container", padding: [12, 16], fill: "#111111", stroke: {thickness: {left:2}, fill: "#D4FF00"}})`,
        `sideLinkAT=I(sideLinkActive, {type: "text", content: "Dashboard", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `sideLinkIn=I(sidebar, {type: "frame", layout: "horizontal", width: "fill_container", padding: [12, 16]})`,
        `sideLinkInT=I(sideLinkIn, {type: "text", content: "Settings", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`
    ];

    // CHUNK 2: Navigation (Tabs, Menus)
    const chunk2 = [
        `navSection=I("screen", {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `navTitle=I(navSection, {type: "text", content: "6. Navigation Components", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,

        // Tabs
        `tabsContainer=I(navSection, {type: "frame", layout: "horizontal", width: "fill_container", stroke: {thickness: {bottom:1}, fill: "#333333"}})`,
        `tab1=I(tabsContainer, {type: "frame", padding: [12, 16], stroke: {thickness: {bottom:2}, fill: "#D4FF00"}})`,
        `tab1T=I(tab1, {type: "text", content: "GENERAL", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `tab2=I(tabsContainer, {type: "frame", padding: [12, 16]})`,
        `tab2T=I(tab2, {type: "text", content: "SECURITY", fill: "#666666", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `tab3=I(tabsContainer, {type: "frame", padding: [12, 16]})`,
        `tab3T=I(tab3, {type: "text", content: "BILLING", fill: "#666666", fontFamily: "JetBrains Mono", fontSize: 14})`,

        // Breadcrumbs
        `bread=I(navSection, {type: "frame", layout: "horizontal", gap: 8, alignItems: "center"})`,
        `b1=I(bread, {type: "text", content: "Home", fill: "#666666", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `sep1=I(bread, {type: "text", content: "/", fill: "#333333", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `b2=I(bread, {type: "text", content: "Application", fill: "#666666", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `sep2=I(bread, {type: "text", content: "/", fill: "#333333", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `b3=I(bread, {type: "text", content: "Database", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`
    ];

    // CHUNK 3: Complex Forms
    const chunk3 = [
        `formSection=I("screen", {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `formTitle=I(formSection, {type: "text", content: "7. Forms & Deep Inputs", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,

        // Grid Row
        `fGrid=I(formSection, {type: "frame", layout: "horizontal", width: "fill_container", gap: 32, alignItems: "start"})`,
        `col1=I(fGrid, {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `col2=I(fGrid, {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,

        // Input States
        `i1Group=I(col1, {type: "frame", layout: "vertical", width: "fill_container", gap: 8})`,
        `i1Label=I(i1Group, {type: "text", content: "DEFAULT TEXT", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 12})`,
        `i1=I(i1Group, {type: "frame", layout: "horizontal", padding: 12, fill: "#000000", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, cornerRadius: 4, width: "fill_container"})`,
        `i1T=I(i1, {type: "text", content: "Placeholder...", fill: "#666666", fontFamily: "JetBrains Mono", fontSize: 14})`,

        `i2Group=I(col1, {type: "frame", layout: "vertical", width: "fill_container", gap: 8})`,
        `i2Label=I(i2Group, {type: "text", content: "FOCUSED ENTRY", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 12})`,
        `i2=I(i2Group, {type: "frame", layout: "horizontal", padding: 12, fill: "#000000", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#D4FF00"}, cornerRadius: 4, width: "fill_container"})`,
        `i2T=I(i2, {type: "text", content: "Active Value|", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`,

        // Textarea
        `taGroup=I(col2, {type: "frame", layout: "vertical", width: "fill_container", gap: 8})`,
        `taLabel=I(taGroup, {type: "text", content: "MULTILINE TEXTAREA", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 12})`,
        `ta=I(taGroup, {type: "frame", layout: "vertical", padding: 12, fill: "#0A0A0A", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#222222"}, cornerRadius: 4, width: "fill_container", height: 120})`,
        `taT=I(ta, {type: "text", content: "Data stream output...", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`,

        // Checkboxes / Radios
        `checkGroup=I(col2, {type: "frame", layout: "vertical", width: "fill_container", gap: 12})`,

        `cb1=I(checkGroup, {type: "frame", layout: "horizontal", gap: 12, alignItems: "center"})`,
        `cb1Box=I(cb1, {type: "frame", width: 16, height: 16, stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, cornerRadius: 2})`,
        `cb1L=I(cb1, {type: "text", content: "Unchecked Property", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`,

        `cb2=I(checkGroup, {type: "frame", layout: "horizontal", gap: 12, alignItems: "center"})`,
        `cb2Box=I(cb2, {type: "frame", width: 16, height: 16, stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#D4FF00"}, fill: "rgba(212,255,0,0.2)", cornerRadius: 2, alignItems: "center", justifyContent: "center"})`,
        `cb2Dot=I(cb2Box, {type: "frame", width: 8, height: 8, fill: "#D4FF00", cornerRadius: 1})`,
        `cb2L=I(cb2, {type: "text", content: "Activated Subroutine", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`
    ];

    // CHUNK 4: Data tables
    const chunk4 = [
        `dataSection=I("screen", {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `dataTitle=I(dataSection, {type: "text", content: "8. Data Tables", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,

        `table=I(dataSection, {type: "frame", layout: "vertical", width: "fill_container", fill: "#0A0A0A", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#222222"}})`,

        // Header Row
        `tHead=I(table, {type: "frame", layout: "horizontal", width: "fill_container", fill: "#111111", stroke: {thickness: {bottom:1}, fill: "#333333"}, padding: [12, 16]})`,
        `th1=I(tHead, {type: "frame", width: 250})`, `th1T=I(th1, {type: "text", content: "INSTANCE ID", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: "bold"})`,
        `th2=I(tHead, {type: "frame", width: "fill_container"})`, `th2T=I(th2, {type: "text", content: "ADDRESS", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: "bold"})`,
        `th3=I(tHead, {type: "frame", width: 120})`, `th3T=I(th3, {type: "text", content: "STATUS", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: "bold"})`,

        // Row 1
        `tR1=I(table, {type: "frame", layout: "horizontal", width: "fill_container", fill: "#000000", stroke: {thickness: {bottom:1}, fill: "#222222"}, padding: [12, 16], alignItems: "center"})`,
        `tr1C1=I(tR1, {type: "frame", width: 250})`, `tr1C1T=I(tr1C1, {type: "text", content: "node-alpha-09", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `tr1C2=I(tR1, {type: "frame", width: "fill_container"})`, `tr1C2T=I(tr1C2, {type: "text", content: "192.168.0.101", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `tr1C3=I(tR1, {type: "frame", width: 120})`,
        `tr1Tag=I(tr1C3, {type: "frame", padding: [4, 8], stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#39FF14"}, cornerRadius: 2})`,
        `tr1TagT=I(tr1Tag, {type: "text", content: "ONLINE", fill: "#39FF14", fontFamily: "JetBrains Mono", fontSize: 12})`,

        // Row 2
        `tR2=I(table, {type: "frame", layout: "horizontal", width: "fill_container", fill: "#0A0A0A", stroke: {thickness: {bottom:1}, fill: "#222222"}, padding: [12, 16], alignItems: "center"})`,
        `tr2C1=I(tR2, {type: "frame", width: 250})`, `tr2C1T=I(tr2C1, {type: "text", content: "node-beta-04", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `tr2C2=I(tR2, {type: "frame", width: "fill_container"})`, `tr2C2T=I(tr2C2, {type: "text", content: "192.168.0.210", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `tr2C3=I(tR2, {type: "frame", width: 120})`,
        `tr2Tag=I(tr2C3, {type: "frame", padding: [4, 8], stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#FF003C"}, cornerRadius: 2})`,
        `tr2TagT=I(tr2Tag, {type: "text", content: "OFFLINE", fill: "#FF003C", fontFamily: "JetBrains Mono", fontSize: 12})`
    ];

    // CHUNK 5: Modal / Alert
    const chunk5 = [
        `modalSection=I("screen", {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `modalTitle=I(modalSection, {type: "text", content: "9. Overlays & Architecture", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,

        `overlay=I(modalSection, {type: "frame", layout: "vertical", width: "fill_container", height: 400, fill: "rgba(0,0,0,0.8)", alignItems: "center", justifyContent: "center"})`,
        `modal=I(overlay, {type: "frame", layout: "vertical", width: 500, fill: "#111111", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, cornerRadius: 4})`,

        `mHead=I(modal, {type: "frame", layout: "horizontal", padding: 16, width: "fill_container", stroke: {thickness: {bottom:1}, fill: "#222222"}, justifyContent: "space_between", alignItems: "center"})`,
        `mHeadT=I(mHead, {type: "text", content: "CRITICAL SYSTEM UPDATE", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 16, fontWeight: "bold"})`,
        `mClose=I(mHead, {type: "frame", padding: 4, stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}})`,
        `mCloseT=I(mClose, {type: "text", content: "X", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`,

        `mBody=I(modal, {type: "frame", padding: 24, width: "fill_container", gap: 16, layout: "vertical"})`,
        `mBodyT=I(mBody, {type: "text", content: "A new version of the Doubletype Engine is required. Continuing with outdated architecture may result in data loss or structural collapse of the UI grid.", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`,

        `mFooter=I(modal, {type: "frame", layout: "horizontal", padding: 16, width: "fill_container", stroke: {thickness: {top:1}, fill: "#222222"}, justifyContent: "end", gap: 12})`,
        `mBtn1=I(mFooter, {type: "frame", padding: [8, 16], stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}})`,
        `mBtn1T=I(mBtn1, {type: "text", content: "CANCEL", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `mBtn2=I(mFooter, {type: "frame", padding: [8, 16], fill: "#D4FF00", cornerRadius: 2})`,
        `mBtn2T=I(mBtn2, {type: "text", content: "INITIATE", fill: "#000000", fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: "bold"})`
    ];

    console.log("Running C1...");
    const r1 = await client.callTool({ name: "batch_design", arguments: { operations: chunk1.join("\n") } });

    // Extract the generated ID for 'screen' so we can append subsequent chunks to it
    const match = r1.content[0].text.match(/Inserted node `([^`]+)`: `\{"type":"frame".*"name":"Doubletype MUI UIKit"/);
    let screenId = "screen";
    if (match && match[1]) {
        screenId = match[1];
        console.log("Screen ID found:", screenId);
    } else {
        console.log("Could not find screen ID, chunks might fail.");
    }

    // Replace "screen" string ref with the actual generated ID for remaining chunks
    const c2 = chunk2.map(cmd => cmd.replace('I("screen"', `I("${screenId}"`));
    const c3 = chunk3.map(cmd => cmd.replace('I("screen"', `I("${screenId}"`));
    const c4 = chunk4.map(cmd => cmd.replace('I("screen"', `I("${screenId}"`));
    const c5 = chunk5.map(cmd => cmd.replace('I("screen"', `I("${screenId}"`));

    console.log("Running C2...");
    await client.callTool({ name: "batch_design", arguments: { operations: c2.join("\n") } });
    console.log("Running C3...");
    await client.callTool({ name: "batch_design", arguments: { operations: c3.join("\n") } });
    console.log("Running C4...");
    await client.callTool({ name: "batch_design", arguments: { operations: c4.join("\n") } });
    console.log("Running C5...");
    await client.callTool({ name: "batch_design", arguments: { operations: c5.join("\n") } });

    console.log("Extensive Generation complete.");
    process.exit(0);
}

main().catch(console.error);
