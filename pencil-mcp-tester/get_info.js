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
    capabilities: {
        prompts: {},
        resources: {},
        tools: {}
    }
});

async function main() {
    await client.connect(transport);

    await client.callTool({
        name: "open_document",
        arguments: { filePathOrTemplate: 'new' }
    });

    const guidelines = await client.callTool({
        name: "get_guidelines",
        arguments: { topic: "design-system" }
    });

    const vars = await client.callTool({
        name: "get_variables",
        arguments: {}
    });

    fs.writeFileSync('schema_info.json', JSON.stringify({ guidelines, vars }, null, 2));
    console.log("Wrote schema_info.json");

    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
