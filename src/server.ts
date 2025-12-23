#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 初始化 MCP Server
const server = new McpServer({
  name: "bun-power-tools",
  version: "1.0.0",
});

// 定義工具列表

server.registerTool(
  "git_commit",
  {
    description: "Perform a git commit with the provided message.",
    inputSchema: z.object({
      message: z.string().describe("The commit message"),
      cwd: z.string().optional().describe("Repository root"),
    }),
  },
  async ({ message, cwd }) => {
    const messageStr = String(message || "");
    const cwdStr = String(cwd || process.cwd());

    if (!messageStr) {
      return { content: [{ type: "text", text: "Commit message cannot be empty." }], isError: true };
    }

    const proc = Bun.spawn(["git", "commit", "-m", messageStr], { cwd: cwdStr, stdout: "pipe", stderr: "pipe" });
    const output = await new Response(proc.stdout).text();
    const error = await new Response(proc.stderr).text();

    if (proc.exitCode !== 0) {
      return { content: [{ type: "text", text: `Commit Failed: ${error || output}` }], isError: true };
    }

    return { content: [{ type: "text", text: `Commit Successful:\n${output}` }] };
  }
);

// 啟動 Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Bun Power Tools MCP Server running on stdio");
}

main();
