import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import process from 'node:process';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
    command: "/Applications/Pencil.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64",
    args: ["--app", "desktop"],
    env: process.env
});

const client = new Client({
    name: "pencil-mcp-tester",
    version: "1.0.0"
}, {
    capabilities: {
        prompts: {},
        resources: {},
        tools: {}
    }
});

async function main() {
    console.log("Connecting to Pencil MCP server...");
    await client.connect(transport);
    console.log("Connected successfully!\n");

    console.log("--- TOOLS ---");
    try {
        const tools = await client.listTools();
        console.log(JSON.stringify(tools, null, 2));
    } catch (e) { console.log(`Error listing tools: ${e.message}`); }

    console.log("\n--- RESOURCES ---");
    try {
        const resources = await client.listResources();
        console.log(JSON.stringify(resources, null, 2));
    } catch (e) { console.log(`Error listing resources: ${e.message}`); }

    console.log("\n--- PROMPTS ---");
    try {
        const prompts = await client.listPrompts();
        console.log(JSON.stringify(prompts, null, 2));
    } catch (e) { console.log(`Error listing prompts: ${e.message}`); }

    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
