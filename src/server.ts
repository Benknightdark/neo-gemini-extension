#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { Glob } from "bun";

// 初始化 MCP Server
const server = new Server(
  {
    name: "bun-power-tools",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 定義工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "bun_fast_glob",
        description: "Efficiently find files using Bun's native Glob API. Use this for large codebases.",
        inputSchema: z.object({
          pattern: z.string().describe("The glob pattern (e.g., '**/*.ts')"),
          cwd: z.string().optional().describe("Current working directory (defaults to current)"),
        }).shape,
      },
      {
        name: "bun_analyze_project",
        description: "Analyze the current project type and dependencies using package.json",
        inputSchema: z.object({
            path: z.string().optional().describe("Path to project root (defaults to current)")
        }).shape
      },
      {
        name: "git_get_staged_diff",
        description: "Get the diff of staged files in git. Use this to understand what changes are about to be committed.",
        inputSchema: z.object({
            cwd: z.string().optional().describe("Repository root")
        }).shape
      },
      {
        name: "git_commit",
        description: "Perform a git commit with the provided message.",
        inputSchema: z.object({
            message: z.string().describe("The commit message"),
            cwd: z.string().optional().describe("Repository root")
        }).shape
      }
    ],
  };
});

// 處理工具呼叫
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "git_get_staged_diff") {
     const cwd = String(args?.cwd || process.cwd());
     const proc = Bun.spawn(["git", "diff", "--cached"], { cwd, stdout: "pipe", stderr: "pipe" });
     const output = await new Response(proc.stdout).text();
     const error = await new Response(proc.stderr).text();
     
     if (proc.exitCode !== 0) {
         return { content: [{ type: "text", text: `Git Error: ${error}` }], isError: true };
     }
     
     if (!output.trim()) {
         return { content: [{ type: "text", text: "No staged changes found." }] };
     }
     
     return { content: [{ type: "text", text: output }] };
  }

  if (name === "git_commit") {
      const message = String(args?.message || "");
      const cwd = String(args?.cwd || process.cwd());
      
      if (!message) {
          return { content: [{ type: "text", text: "Commit message cannot be empty." }], isError: true };
      }

      const proc = Bun.spawn(["git", "commit", "-m", message], { cwd, stdout: "pipe", stderr: "pipe" });
      const output = await new Response(proc.stdout).text();
      const error = await new Response(proc.stderr).text();

      if (proc.exitCode !== 0) {
           return { content: [{ type: "text", text: `Commit Failed: ${error || output}` }], isError: true };
      }

      return { content: [{ type: "text", text: `Commit Successful:\n${output}` }] };
  }

  if (name === "bun_fast_glob") {
    const pattern = String(args?.pattern || "**/*");
    const cwd = String(args?.cwd || process.cwd());
    
    try {
        const glob = new Glob(pattern);
        const files: string[] = [];
        // Scan asynchronously
        for await (const file of glob.scan({ cwd, onlyFiles: true })) {
            files.push(file);
            if (files.length >= 200) break; // Limit results
        }
        
        return {
            content: [{ type: "text", text: files.join("\n") }]
        };
    } catch (err: any) {
        return {
            content: [{ type: "text", text: `Error: ${err.message}` }],
            isError: true,
        };
    }
  }

  if (name === "bun_analyze_project") {
    const cwd = String(args?.path || process.cwd());
    try {
        const pkgPath = `${cwd}/package.json`;
        const file = Bun.file(pkgPath);
        
        if (!await file.exists()) {
            return { content: [{ type: "text", text: "No package.json found." }] };
        }

        const pkg = await file.json();
        const info = {
            name: pkg.name,
            scripts: Object.keys(pkg.scripts || {}),
            dependencies: Object.keys(pkg.dependencies || {}),
            devDependencies: Object.keys(pkg.devDependencies || {}),
        };

        return {
            content: [{ type: "text", text: JSON.stringify(info, null, 2) }]
        };
    } catch (err: any) {
        return {
            content: [{ type: "text", text: `Error reading package.json: ${err.message}` }],
            isError: true,
        }
    }
  }

  throw new Error(`Tool not found: ${name}`);
});

// 啟動 Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Bun Power Tools MCP Server running on stdio");
}

main();
