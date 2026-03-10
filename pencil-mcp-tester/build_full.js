import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import process from 'node:process';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
    command: "/Applications/Pencil.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64",
    args: ["--app", "desktop"],
    env: process.env
});

const client = new Client({ name: "pencil-full", version: "1" }, { capabilities: { tools: {} } });

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

    // Clear previous nodes
    try {
        const searchRes = await client.callTool({
            name: "batch_get",
            arguments: { patterns: [{ name: "Doubletype MUI UIKit" }, { name: "Doubletype DS" }, { name: "Doubletype Full UI Kit" }] }
        });
        const nodes = JSON.parse(searchRes.content[0].text);
        if (nodes.length > 0) {
            const delOps = nodes.filter(n => n.id).map(n => `D("${n.id}")`);
            if (delOps.length > 0) {
                await client.callTool({ name: "batch_design", arguments: { operations: delOps.join("\n") } });
                console.log("Deleted old frames.");
            }
        }
    } catch (e) { }

    // CHUNK 1: Base Screen, Colors, and Typography
    const chunk1 = [
        `screen=I(document, {type: "frame", name: "Doubletype Full UI Kit", layout: "vertical", fill: "#000000", width: 1440, height: "fit_content(4000)", padding: 64, gap: 64})`,

        // Header
        `header=I(screen, {type: "frame", layout: "vertical", width: "fill_container", gap: 16})`,
        `title=I(header, {type: "text", content: "DOUBLETYPE DESIGN SYSTEM", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 48, fontWeight: "bold"})`,
        `subtitle=I(header, {type: "text", content: "Comprehensive UI/UX Specification Document v2.0", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 16})`,

        // 1. Color Palette Section
        `colorSection=I(screen, {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `colorTitle=I(colorSection, {type: "text", content: "1. Colors", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,
        `surfRow=I(colorSection, {type: "frame", layout: "horizontal", gap: 16, width: "fill_container"})`,
        `s1=I(surfRow, {type: "frame", layout: "vertical", width: 160, height: 160, fill: "#000000", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, cornerRadius: [0,0,0,0], padding: 16, justifyContent: "end"})`,
        `s1t=I(s1, {type: "text", content: "bg-base", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `s2=I(surfRow, {type: "frame", layout: "vertical", width: 160, height: 160, fill: "#0A0A0A", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, padding: 16, justifyContent: "end"})`,
        `s2t=I(s2, {type: "text", content: "bg-surface-1", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `s3=I(surfRow, {type: "frame", layout: "vertical", width: 160, height: 160, fill: "#111111", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, padding: 16, justifyContent: "end"})`,
        `s3t=I(s3, {type: "text", content: "bg-surface-2", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14})`,

        // 2. Typography Section
        `typoSection=I(screen, {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `typoTitle=I(typoSection, {type: "text", content: "2. Typography (JetBrains Mono)", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,
        `displayTypo=I(typoSection, {type: "text", content: "Display - 48px", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 48, fontWeight: "bold"})`,
        `xlTypo=I(typoSection, {type: "text", content: "Text XL - 24px", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,
        `lgTypo=I(typoSection, {type: "text", content: "Text LG - 20px", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 20})`,
        `baseTypo=I(typoSection, {type: "text", content: "Text Base - 16px. Used for most body copy. The quick brown fox jumps.", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 16})`,
        `smTypo=I(typoSection, {type: "text", content: "Text SM - 14px. Used for buttons and secondary copy.", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`,
        `xsTypo=I(typoSection, {type: "text", content: "TEXT XS - 12PX. USED FOR LABELS.", fill: "#666666", fontFamily: "JetBrains Mono", fontSize: 12})`
    ];

    // CHUNK 2: Spacing & Basic Components
    const chunk2 = [
        // 3. Spacing Section
        `spaceSection=I("screen", {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
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

        // 4. Components Section
        `btnSection=I("screen", {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `btnSectionTitle=I(btnSection, {type: "text", content: "4. Components & Feedback", fill: "#D4FF00", fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: "bold"})`,
        `btnRow=I(btnSection, {type: "frame", layout: "horizontal", gap: 16, width: "fill_container", alignItems: "center"})`,
        `btn1=I(btnRow, {type: "frame", layout: "horizontal", padding: [12, 24], fill: "#D4FF00", cornerRadius: [4,4,4,4]})`,
        `btn1t=I(btn1, {type: "text", content: "PRIMARY", fill: "#000000", fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: "bold"})`,
        `btn2=I(btnRow, {type: "frame", layout: "horizontal", padding: [12, 24], fill: "#111111", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, cornerRadius: [4,4,4,4]})`,
        `btn2t=I(btn2, {type: "text", content: "SECONDARY", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: "bold"})`,

        // Badges / Tags
        `tagRow=I(btnSection, {type: "frame", layout: "horizontal", gap: 12, width: "fill_container", alignItems: "center"})`,
        `tagNeutral=I(tagRow, {type: "frame", layout: "horizontal", padding: [4, 8], fill: "#111111", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, cornerRadius: [2,2,2,2]})`,
        `tagNeutralT=I(tagNeutral, {type: "text", content: "NEUTRAL", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 12})`,
        `tagSuccess=I(tagRow, {type: "frame", layout: "horizontal", padding: [4, 8], stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#39FF14"}, cornerRadius: [2,2,2,2]})`,
        `tagSuccessT=I(tagSuccess, {type: "text", content: "NOMINAL", fill: "#39FF14", fontFamily: "JetBrains Mono", fontSize: 12})`,
        `tagAlert=I(tagRow, {type: "frame", layout: "horizontal", padding: [4, 8], stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#FF003C"}, cornerRadius: [2,2,2,2]})`,
        `tagAlertT=I(tagAlert, {type: "text", content: "CRITICAL", fill: "#FF003C", fontFamily: "JetBrains Mono", fontSize: 12})`
    ];

    // CHUNK 3: Layouts
    const chunk3 = [
        // 5. Layouts Section
        `layoutSection=I("screen", {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
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

    // CHUNK 4: Navigation
    const chunk4 = [
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

    // CHUNK 5: Forms
    const chunk5 = [
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

    // CHUNK 6: Data tables
    const chunk6 = [
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

    // CHUNK 7: Modal / Alert
    const chunk7 = [
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

    // CHUNK 8: Landing Page Hero
    const chunk8 = [
        `landingSection=I("screen", {type: "frame", layout: "vertical", width: "fill_container", gap: 64, fill: "#0A0A0A", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#222222"}, padding: 64})`,

        // Top Nav within Landing
        `landNav=I(landingSection, {type: "frame", layout: "horizontal", width: "fill_container", justifyContent: "space_between", alignItems: "center"})`,
        `landBrand=I(landNav, {type: "text", content: "DOUBLETYPE_OP", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 16, fontWeight: "bold"})`,
        `landBtn=I(landNav, {type: "frame", layout: "horizontal", padding: [8, 16], fill: "#111111", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}, cornerRadius: 4})`,
        `landBtnT=I(landBtn, {type: "text", content: "DOCUMENTATION", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: "bold"})`,

        // Hero Area
        `heroArea=I(landingSection, {type: "frame", layout: "vertical", width: "fill_container", gap: 24, alignItems: "center", padding: [120, 0]})`,
        `heroTag=I(heroArea, {type: "frame", padding: [4, 12], stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#39FF14"}, cornerRadius: 50})`,
        `heroTagT=I(heroTag, {type: "text", content: "v2.0 INITIALIZATION COMPLETE", fill: "#39FF14", fontFamily: "JetBrains Mono", fontSize: 12})`,

        `heroTitle=I(heroArea, {type: "text", content: "THE RAW DATA EDITOR.", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 64, fontWeight: "bold"})`,
        `heroSubtitle=I(heroArea, {type: "text", content: "Doubletype is a high-performance desktop code editor and IDE. Built for maximum velocity.", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 20})`,

        `heroCta=I(heroArea, {type: "frame", layout: "horizontal", gap: 16, alignItems: "center", padding: [24, 0]})`,
        `gitBtn=I(heroCta, {type: "frame", layout: "horizontal", padding: [16, 32], fill: "#D4FF00", cornerRadius: 4})`,
        `gitBtnT=I(gitBtn, {type: "text", content: "DOWNLOAD ON GITHUB", fill: "#000000", fontFamily: "JetBrains Mono", fontSize: 16, fontWeight: "bold"})`,
        `npmBtn=I(heroCta, {type: "text", content: "v1.0.0 DMG Available", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`
    ];

    // CHUNK 9: Landing Page Features
    const chunk9 = [
        `featArea=I(landingSection, {type: "frame", layout: "horizontal", width: "fill_container", gap: 32, padding: [64, 0]})`,

        // Feature 1
        `feat1=I(featArea, {type: "frame", layout: "vertical", width: "fill_container", gap: 16, padding: 32, fill: "#000000", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}})`,
        `f1Icon=I(feat1, {type: "frame", width: 48, height: 48, fill: "#111111", cornerRadius: 4, stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#222222"}})`,
        `f1Title=I(feat1, {type: "text", content: "POWERFUL WORKSPACE", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 16, fontWeight: "bold"})`,
        `f1Desc=I(feat1, {type: "text", content: "Advanced dual-pane workspace and docking system for optimal code layout.", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`,

        // Feature 2
        `feat2=I(featArea, {type: "frame", layout: "vertical", width: "fill_container", gap: 16, padding: 32, fill: "#000000", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}})`,
        `f2Icon=I(feat2, {type: "frame", width: 48, height: 48, fill: "#111111", cornerRadius: 4, stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#222222"}})`,
        `f2Title=I(feat2, {type: "text", content: "INTELLIGENT OMNISEARCH", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 16, fontWeight: "bold"})`,
        `f2Desc=I(feat2, {type: "text", content: "Instant fuzzy-search and file navigation across your entire project file tree.", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`,

        // Feature 3
        `feat3=I(featArea, {type: "frame", layout: "vertical", width: "fill_container", gap: 16, padding: 32, fill: "#000000", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#333333"}})`,
        `f3Icon=I(feat3, {type: "frame", width: 48, height: 48, fill: "#111111", cornerRadius: 4, stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#222222"}})`,
        `f3Title=I(feat3, {type: "text", content: "EXTENSIBLE PLUGIN API", fill: "#FFFFFF", fontFamily: "JetBrains Mono", fontSize: 16, fontWeight: "bold"})`,
        `f3Desc=I(feat3, {type: "text", content: "Build custom extensions and execute them natively directly inside the editor.", fill: "#AAAAAA", fontFamily: "JetBrains Mono", fontSize: 14})`
    ];

    console.log("Running C1...");
    const r1 = await client.callTool({ name: "batch_design", arguments: { operations: chunk1.join("\n") } });

    // Extract the generated ID for 'screen'
    const match = r1.content[0].text.match(/Inserted node `([^`]+)`: `\{"type":"frame".*"name":"Doubletype Full UI Kit"/);
    let screenId = "screen";
    if (match && match[1]) {
        screenId = match[1];
        console.log("Screen ID found:", screenId);
    } else {
        console.log("Could not find screen ID, chunks might fail.");
    }

    // Replace "screen" string ref with the actual ID for remaining chunks
    const c2 = chunk2.map(cmd => cmd.replace('I("screen"', `I("${screenId}"`));
    const c3 = chunk3.map(cmd => cmd.replace('I("screen"', `I("${screenId}"`));
    const c4 = chunk4.map(cmd => cmd.replace('I("screen"', `I("${screenId}"`));
    const c5 = chunk5.map(cmd => cmd.replace('I("screen"', `I("${screenId}"`));
    const c6 = chunk6.map(cmd => cmd.replace('I("screen"', `I("${screenId}"`));
    const c7 = chunk7.map(cmd => cmd.replace('I("screen"', `I("${screenId}"`));
    const c8 = chunk8.map(cmd => cmd.replace('I("screen"', `I("${screenId}"`));
    const c9 = chunk9.map(cmd => cmd.replace('I("screen"', `I("${screenId}"`));

    console.log("Running C2...");
    await client.callTool({ name: "batch_design", arguments: { operations: c2.join("\n") } });
    console.log("Running C3...");
    await client.callTool({ name: "batch_design", arguments: { operations: c3.join("\n") } });
    console.log("Running C4...");
    await client.callTool({ name: "batch_design", arguments: { operations: c4.join("\n") } });
    console.log("Running C5...");
    await client.callTool({ name: "batch_design", arguments: { operations: c5.join("\n") } });
    console.log("Running C6...");
    await client.callTool({ name: "batch_design", arguments: { operations: c6.join("\n") } });
    console.log("Running C7...");
    await client.callTool({ name: "batch_design", arguments: { operations: c7.join("\n") } });

    console.log("Running C8...");
    const r8 = await client.callTool({ name: "batch_design", arguments: { operations: c8.join("\n") } });

    // Extract the generated ID for 'landingSection' from Chunk 8
    const match8 = r8.content[0].text.match(/Inserted node `([^`]+)`: `\{.*"name":"landingSection"/);
    let landId = "landingSection";
    if (match8 && match8[1]) {
        landId = match8[1];
        console.log("Landing Section ID found:", landId);
    } else {
        console.log("Could not find Landing Section ID, chunk 9 might fail.");
    }

    // Pass the landId into Chunk 9
    const c9Fixed = c9.map(cmd => cmd.replace('I(landingSection', `I("${landId}"`));

    console.log("Running C9...");
    await client.callTool({ name: "batch_design", arguments: { operations: c9Fixed.join("\n") } });

    console.log("Extensive Generation complete.");
    process.exit(0);
}

main().catch(console.error);
