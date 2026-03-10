import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import process from 'node:process';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
    command: "/Applications/Pencil.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64",
    args: ["--app", "desktop"],
    env: process.env
});

const client = new Client({ name: "pencil-shadcn", version: "1" }, { capabilities: { tools: {} } });

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

    // Clear ALL previous nodes on canvas to ensure a clean slate
    try {
        const searchRes = await client.callTool({
            name: "batch_get",
            arguments: { patterns: [{ name: "Doubletype MUI UIKit" }, { name: "Doubletype DS" }, { name: "Doubletype Full UI Kit" }, { name: "shadcn-ui-kit" }] }
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

    // ---- CHUNK 1: Base Screen, Typography, Colors
    const chunk1 = [
        `screen=I(document, {type: "frame", name: "shadcn-ui-kit", layout: "vertical", fill: "#FFFFFF", width: 1440, height: "fit_content(2000)", padding: 64, gap: 64})`,

        // Header
        `header=I(screen, {type: "frame", layout: "vertical", width: "fill_container", gap: 16})`,
        `title=I(header, {type: "text", content: "SHADCN/UI SYSTEM", fill: "#09090B", fontFamily: "Inter", fontSize: 40, fontWeight: "bold"})`,
        `subtitle=I(header, {type: "text", content: "Beautifully designed components built with Tailwind CSS concepts.", fill: "#71717A", fontFamily: "Inter", fontSize: 18})`,

        // 1. Color Palette Section (Zinc/Slate)
        `colorSection=I(screen, {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `colorTitle=I(colorSection, {type: "text", content: "Colors (Zinc)", fill: "#09090B", fontFamily: "Inter", fontSize: 24, fontWeight: "bold"})`,
        `surfRow=I(colorSection, {type: "frame", layout: "horizontal", gap: 16, width: "fill_container"})`,

        `s1=I(surfRow, {type: "frame", layout: "vertical", width: 120, height: 120, fill: "#FFFFFF", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#E4E4E7"}, cornerRadius: 8, padding: 12, justifyContent: "end"})`,
        `s1t=I(s1, {type: "text", content: "Background", fill: "#09090B", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,

        `s2=I(surfRow, {type: "frame", layout: "vertical", width: 120, height: 120, fill: "#F4F4F5", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#E4E4E7"}, cornerRadius: 8, padding: 12, justifyContent: "end"})`,
        `s2t=I(s2, {type: "text", content: "Muted", fill: "#09090B", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,

        `s3=I(surfRow, {type: "frame", layout: "vertical", width: 120, height: 120, fill: "#09090B", cornerRadius: 8, padding: 12, justifyContent: "end"})`,
        `s3t=I(s3, {type: "text", content: "Foreground", fill: "#FAFAFA", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,

        `s4=I(surfRow, {type: "frame", layout: "vertical", width: 120, height: 120, fill: "#EF4444", cornerRadius: 8, padding: 12, justifyContent: "end"})`,
        `s4t=I(s4, {type: "text", content: "Destructive", fill: "#FFFFFF", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,

        // 2. Typography Section
        `typoSection=I(screen, {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `typoTitle=I(typoSection, {type: "text", content: "Typography", fill: "#09090B", fontFamily: "Inter", fontSize: 24, fontWeight: "bold"})`,
        `h1Typo=I(typoSection, {type: "text", content: "h1. Heading", fill: "#09090B", fontFamily: "Inter", fontSize: 48, fontWeight: "bold"})`,
        `h2Typo=I(typoSection, {type: "text", content: "h2. Heading", fill: "#09090B", fontFamily: "Inter", fontSize: 30, fontWeight: "bold", stroke: {thickness: {bottom:1}, fill: "#E4E4E7"}, padding: [0,0,8,0]})`,
        `h3Typo=I(typoSection, {type: "text", content: "h3. Heading", fill: "#09090B", fontFamily: "Inter", fontSize: 24, fontWeight: "bold"})`,
        `pTypo=I(typoSection, {type: "text", content: "P. The quick brown fox jumps over the lazy dog. Used for primary narrative.", fill: "#71717A", fontFamily: "Inter", fontSize: 16})`,
        `smallTypo=I(typoSection, {type: "text", content: "Small. Email addresses and secondary text.", fill: "#71717A", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`
    ];

    // ---- CHUNK 2: Buttons & Feedback
    const chunk2 = [
        `btnSection=I("screen", {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `btnTitle=I(btnSection, {type: "text", content: "Buttons (h-10, px-4, py-2, rounded-md)", fill: "#09090B", fontFamily: "Inter", fontSize: 24, fontWeight: "bold"})`,

        `btnRow=I(btnSection, {type: "frame", layout: "horizontal", gap: 16, width: "fill_container", alignItems: "center"})`,

        // Default
        `btnDef=I(btnRow, {type: "frame", layout: "horizontal", padding: [8, 16], fill: "#09090B", cornerRadius: 6, height: 40, alignItems: "center"})`,
        `btnDefT=I(btnDef, {type: "text", content: "Default", fill: "#FAFAFA", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,

        // Secondary
        `btnSec=I(btnRow, {type: "frame", layout: "horizontal", padding: [8, 16], fill: "#F4F4F5", cornerRadius: 6, height: 40, alignItems: "center"})`,
        `btnSecT=I(btnSec, {type: "text", content: "Secondary", fill: "#09090B", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,

        // Outline
        `btnOut=I(btnRow, {type: "frame", layout: "horizontal", padding: [8, 16], stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#E4E4E7"}, cornerRadius: 6, height: 40, alignItems: "center"})`,
        `btnOutT=I(btnOut, {type: "text", content: "Outline", fill: "#09090B", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,

        // Destructive
        `btnDes=I(btnRow, {type: "frame", layout: "horizontal", padding: [8, 16], fill: "#EF4444", cornerRadius: 6, height: 40, alignItems: "center"})`,
        `btnDesT=I(btnDes, {type: "text", content: "Destructive", fill: "#FAFAFA", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,

        // Ghost
        `btnGho=I(btnRow, {type: "frame", layout: "horizontal", padding: [8, 16], fill: "rgba(244,244,245,0)", cornerRadius: 6, height: 40, alignItems: "center"})`,
        `btnGhoT=I(btnGho, {type: "text", content: "Ghost", fill: "#09090B", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,

        // Badges
        `badgeRow=I(btnSection, {type: "frame", layout: "horizontal", gap: 8, width: "fill_container", alignItems: "center", padding: [16,0]})`,
        `badDef=I(badgeRow, {type: "frame", layout: "horizontal", padding: [2, 10], fill: "#09090B", cornerRadius: 50})`,
        `badDefT=I(badDef, {type: "text", content: "Badge", fill: "#FAFAFA", fontFamily: "Inter", fontSize: 12, fontWeight: "600"})`,
        `badSec=I(badgeRow, {type: "frame", layout: "horizontal", padding: [2, 10], fill: "#F4F4F5", cornerRadius: 50})`,
        `badSecT=I(badSec, {type: "text", content: "Secondary", fill: "#09090B", fontFamily: "Inter", fontSize: 12, fontWeight: "600"})`,
        `badOut=I(badgeRow, {type: "frame", layout: "horizontal", padding: [2, 10], stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#E4E4E7"}, cornerRadius: 50})`,
        `badOutT=I(badOut, {type: "text", content: "Outline", fill: "#09090B", fontFamily: "Inter", fontSize: 12, fontWeight: "600"})`,
        `badDes=I(badgeRow, {type: "frame", layout: "horizontal", padding: [2, 10], fill: "#EF4444", cornerRadius: 50})`,
        `badDesT=I(badDes, {type: "text", content: "Destructive", fill: "#FAFAFA", fontFamily: "Inter", fontSize: 12, fontWeight: "600"})`
    ];

    // ---- CHUNK 3: Inputs & Forms
    const chunk3 = [
        `formSection=I("screen", {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `formTitle=I(formSection, {type: "text", content: "Inputs", fill: "#09090B", fontFamily: "Inter", fontSize: 24, fontWeight: "bold"})`,

        `fGrid=I(formSection, {type: "frame", layout: "horizontal", width: "fill_container", gap: 32, alignItems: "start"})`,
        `col1=I(fGrid, {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `col2=I(fGrid, {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,

        // Input Group 1
        `i1Group=I(col1, {type: "frame", layout: "vertical", width: "fill_container", gap: 8})`,
        `i1Label=I(i1Group, {type: "text", content: "Email", fill: "#09090B", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,
        `i1=I(i1Group, {type: "frame", layout: "horizontal", padding: [8, 12], fill: "#FFFFFF", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#E4E4E7"}, cornerRadius: 6, width: "fill_container", height: 40, alignItems: "center"})`,
        `i1T=I(i1, {type: "text", content: "m@example.com", fill: "#A1A1AA", fontFamily: "Inter", fontSize: 14})`,
        `i1Desc=I(i1Group, {type: "text", content: "Enter your email address to subscribe.", fill: "#71717A", fontFamily: "Inter", fontSize: 14})`,

        // Textarea
        `taGroup=I(col2, {type: "frame", layout: "vertical", width: "fill_container", gap: 8})`,
        `taLabel=I(taGroup, {type: "text", content: "Bio", fill: "#09090B", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,
        `ta=I(taGroup, {type: "frame", layout: "vertical", padding: 12, fill: "#FFFFFF", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#E4E4E7"}, cornerRadius: 6, width: "fill_container", height: 100})`,
        `taT=I(ta, {type: "text", content: "Tell us a little bit about yourself", fill: "#A1A1AA", fontFamily: "Inter", fontSize: 14})`
    ];

    // ---- CHUNK 4: Cards
    const chunk4 = [
        `cardSection=I("screen", {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `cardTitle=I(cardSection, {type: "text", content: "Cards", fill: "#09090B", fontFamily: "Inter", fontSize: 24, fontWeight: "bold"})`,

        `cardRow=I(cardSection, {type: "frame", layout: "horizontal", gap: 24, width: "fill_container"})`,

        // Card 1
        `card1=I(cardRow, {type: "frame", layout: "vertical", width: 350, fill: "#FFFFFF", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#E4E4E7"}, cornerRadius: 8, padding: 24, gap: 24})`,
        `c1Head=I(card1, {type: "frame", layout: "vertical", gap: 6})`,
        `c1Title=I(c1Head, {type: "text", content: "Create project", fill: "#09090B", fontFamily: "Inter", fontSize: 24, fontWeight: "600"})`,
        `c1Desc=I(c1Head, {type: "text", content: "Deploy your new project in one-click.", fill: "#71717A", fontFamily: "Inter", fontSize: 14})`,

        `c1Content=I(card1, {type: "frame", layout: "vertical", gap: 16})`,
        `c1In1=I(c1Content, {type: "frame", layout: "vertical", gap: 8})`,
        `c1L1=I(c1In1, {type: "text", content: "Name", fill: "#09090B", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,
        `c1Ib1=I(c1In1, {type: "frame", padding: [8, 12], stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#E4E4E7"}, cornerRadius: 6, height: 40})`,
        `c1Ibt1=I(c1Ib1, {type: "text", content: "Name of your project", fill: "#A1A1AA", fontFamily: "Inter", fontSize: 14})`,

        `c1Footer=I(card1, {type: "frame", layout: "horizontal", justifyContent: "space_between", width: "fill_container"})`,
        `c1FBtn1=I(c1Footer, {type: "frame", padding: [8, 16], stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#E4E4E7"}, cornerRadius: 6})`, `c1FB1T=I(c1FBtn1, {type: "text", content: "Cancel", fill: "#09090B", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,
        `c1FBtn2=I(c1Footer, {type: "frame", padding: [8, 16], fill: "#09090B", cornerRadius: 6})`, `c1FB2T=I(c1FBtn2, {type: "text", content: "Deploy", fill: "#FAFAFA", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`
    ];

    // ---- CHUNK 5: Layout (Dashboard Sidebar)
    const chunk5 = [
        `layoutSection=I("screen", {type: "frame", layout: "vertical", width: "fill_container", gap: 24})`,
        `layoutTitle=I(layoutSection, {type: "text", content: "Dashboard Layout", fill: "#09090B", fontFamily: "Inter", fontSize: 24, fontWeight: "bold"})`,

        `dashContainer=I(layoutSection, {type: "frame", layout: "horizontal", width: "fill_container", height: 500, fill: "#F4F4F5", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#E4E4E7"}, cornerRadius: 8})`,

        // Sidebar
        `sidebar=I(dashContainer, {type: "frame", layout: "vertical", width: 240, height: "fill_container", fill: "#FFFFFF", stroke: {thickness: {right:1}, fill: "#E4E4E7"}, padding: 24, gap: 32})`,

        `sideBrand=I(sidebar, {type: "frame", layout: "horizontal", alignItems: "center", gap: 12})`,
        `sBrandIcon=I(sideBrand, {type: "frame", width: 32, height: 32, fill: "#09090B", cornerRadius: 6})`,
        `sBrandT=I(sideBrand, {type: "text", content: "Acme Inc", fill: "#09090B", fontFamily: "Inter", fontSize: 16, fontWeight: "600"})`,

        `navGroup=I(sidebar, {type: "frame", layout: "vertical", gap: 4})`,
        `n1=I(navGroup, {type: "frame", layout: "horizontal", padding: [8, 12], fill: "#F4F4F5", cornerRadius: 6})`,
        `n1t=I(n1, {type: "text", content: "Dashboard", fill: "#09090B", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,
        `n2=I(navGroup, {type: "frame", layout: "horizontal", padding: [8, 12]})`,
        `n2t=I(n2, {type: "text", content: "Orders", fill: "#71717A", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,
        `n3=I(navGroup, {type: "frame", layout: "horizontal", padding: [8, 12]})`,
        `n3t=I(n3, {type: "text", content: "Products", fill: "#71717A", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,
        `n4=I(navGroup, {type: "frame", layout: "horizontal", padding: [8, 12]})`,
        `n4t=I(n4, {type: "text", content: "Customers", fill: "#71717A", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`
    ];

    // ---- CHUNK 6: Layout (Dashboard Header + Content)
    const chunk6 = [
        `dashContent=I("dashContainer", {type: "frame", layout: "vertical", width: "fill_container", height: "fill_container"})`,

        // Dash Topbar
        `dashHeader=I(dashContent, {type: "frame", layout: "horizontal", width: "fill_container", height: 64, fill: "#FFFFFF", stroke: {thickness: {bottom:1}, fill: "#E4E4E7"}, padding: [0, 24], alignItems: "center", justifyContent: "space_between"})`,
        `dhSearch=I(dashHeader, {type: "frame", layout: "horizontal", padding: [8, 12], width: 300, stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#E4E4E7"}, cornerRadius: 6})`,
        `dhSearchT=I(dhSearch, {type: "text", content: "Search...", fill: "#A1A1AA", fontFamily: "Inter", fontSize: 14})`,
        `dhUser=I(dashHeader, {type: "frame", width: 32, height: 32, fill: "#E4E4E7", cornerRadius: 50})`,

        // Dash Main Area
        `dashMain=I(dashContent, {type: "frame", layout: "vertical", width: "fill_container", padding: 32, gap: 24})`,
        `dmHead=I(dashMain, {type: "frame", layout: "horizontal", width: "fill_container", justifyContent: "space_between", alignItems: "center"})`,
        `dmTitle=I(dmHead, {type: "text", content: "Dashboard", fill: "#09090B", fontFamily: "Inter", fontSize: 30, fontWeight: "bold"})`,
        `dmBtn=I(dmHead, {type: "frame", padding: [8, 16], fill: "#09090B", cornerRadius: 6})`,
        `dmBtnT=I(dmBtn, {type: "text", content: "Download", fill: "#FAFAFA", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,

        // Grid of mini-cards
        `dmGrid=I(dashMain, {type: "frame", layout: "horizontal", width: "fill_container", gap: 24})`,
        `dmC1=I(dmGrid, {type: "frame", layout: "vertical", width: "fill_container", fill: "#FFFFFF", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#E4E4E7"}, cornerRadius: 8, padding: 24, gap: 8})`,
        `dmC1T1=I(dmC1, {type: "text", content: "Total Revenue", fill: "#09090B", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,
        `dmC1T2=I(dmC1, {type: "text", content: "$45,231.89", fill: "#09090B", fontFamily: "Inter", fontSize: 24, fontWeight: "bold"})`,
        `dmC1T3=I(dmC1, {type: "text", content: "+20.1% from last month", fill: "#71717A", fontFamily: "Inter", fontSize: 12})`,

        `dmC2=I(dmGrid, {type: "frame", layout: "vertical", width: "fill_container", fill: "#FFFFFF", stroke: {thickness: {top:1,left:1,right:1,bottom:1}, fill: "#E4E4E7"}, cornerRadius: 8, padding: 24, gap: 8})`,
        `dmC2T1=I(dmC2, {type: "text", content: "Subscriptions", fill: "#09090B", fontFamily: "Inter", fontSize: 14, fontWeight: "500"})`,
        `dmC2T2=I(dmC2, {type: "text", content: "+2350", fill: "#09090B", fontFamily: "Inter", fontSize: 24, fontWeight: "bold"})`,
        `dmC2T3=I(dmC2, {type: "text", content: "+180.1% from last month", fill: "#71717A", fontFamily: "Inter", fontSize: 12})`
    ];

    console.log("Running C1...");
    const r1 = await client.callTool({ name: "batch_design", arguments: { operations: chunk1.join("\n") } });

    const match = r1.content[0].text.match(/Inserted node `([^`]+)`: `\{"type":"frame".*"name":"shadcn-ui-kit"/);
    let screenId = "screen";
    if (match && match[1]) {
        screenId = match[1];
        console.log("Screen ID found:", screenId);
    } else {
        console.log("Could not find screen ID, chunks might fail.");
    }

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
    const r5 = await client.callTool({ name: "batch_design", arguments: { operations: c5.join("\n") } });

    const matchRootDash = r5.content[0].text.match(/Inserted node `([^`]+)`: `\{"type":"frame".*"height":500,"fill":"#F4F4F5"/);
    let dashId = "dashContainer";
    if (matchRootDash && matchRootDash[1]) {
        dashId = matchRootDash[1];
        console.log("Dash ID found:", dashId);
    }

    const c6 = chunk6.map(cmd => cmd.replace('I("dashContainer"', `I("${dashId}"`));
    console.log("Running C6...");
    await client.callTool({ name: "batch_design", arguments: { operations: c6.join("\n") } });

    console.log("Extensive Generation complete.");
    process.exit(0);
}

main().catch(console.error);
