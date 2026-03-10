import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import process from 'node:process';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';

const transport = new StdioClientTransport({
    command: "/Applications/Pencil.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64",
    args: ["--app", "desktop"],
    env: process.env
});

const client = new Client({ name: "pencil", version: "1" }, { capabilities: { tools: {} } });

async function main() {
    await client.connect(transport);
    const vars = await client.callTool({ name: "get_variables", arguments: {} });
    fs.writeFileSync('current_vars.json', JSON.stringify(vars, null, 2));
    console.log("Wrote current_vars.json");
    process.exit(0);
}
main();
