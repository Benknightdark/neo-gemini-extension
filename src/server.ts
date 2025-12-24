#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 初始化 MCP Server
const server = new McpServer({
  name: "neo-tools",
  version: "1.0.0",
});

// 定義 Tool
server.registerTool(
  "run_git_commit",
  {
    description: "執行 Git Commit 指令",
    inputSchema: {
      message: z.string().describe("符合 Conventional Commits 規範的 Commit Message"),
    },
  },
  async ({ message }) => {
    const { exitCode, stdout, stderr } = Bun.spawnSync(["git", "commit", "-m", message], {
      cwd: process.cwd(),
    });

    if (exitCode !== 0) {
      const error = new TextDecoder().decode(stderr);
      return {
        content: [{ type: "text", text: `Commit 失敗:\n${error}` }],
        isError: true,
      };
    }

    const output = new TextDecoder().decode(stdout);
    return {
      content: [{ type: "text", text: `Commit 成功:\n${output}` }],
    };
  }
);

// 定義 Prompt
server.registerPrompt(
  "git_commit",
  {
    description: "將目前所有變更 (Staged) 轉化為高品質的 Conventional Commits 訊息",
  },
  async () => {
    // 1. 執行 git add .
    Bun.spawnSync(["git", "add", "."], { cwd: process.cwd() });

    // 2. 取得 git diff --staged
    const { stdout } = Bun.spawnSync(["git", "diff", "--staged"], { cwd: process.cwd() });
    const diff = new TextDecoder().decode(stdout);

    // 3. 組合 Prompt
    // 從 prompts.toml 讀取 Prompt Template
    const tomlPath = `${import.meta.dir}/prompts.toml`;
    const tomlContent = await Bun.file(tomlPath).text();
    const prompts = Bun.TOML.parse(tomlContent) as any;
    const promptTemplate = prompts.git_commit.template;

    const finalPrompt = promptTemplate.replace("{{args}}", diff);

    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: finalPrompt,
          },
        },
      ],
    };
  }
);

// 啟動 Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Neo Tools MCP Server running on stdio");
}

main();
