# Bun Power Tools Extension

This extension provides high-performance tools powered by the Bun runtime.

## Tools Available

### `bun_fast_glob`
Use this tool when the user asks to "find files", "list files matching X", or "search the directory". 
It is much faster than standard system commands.

### `bun_analyze_project`
Use this tool when the user asks about the "project stack", "dependencies", or "available scripts".
It reads the `package.json` directly.

### Git Tools
The extension provides tools to interact with Git:
- `git_get_staged_diff`: Get the changes that are staged for commit.
- `git_commit`: Perform the actual commit.

**Workflow for Commits:**
1. If the user asks to "smart commit", "commit these changes", or "write a commit message":
   - First, call `git_get_staged_diff`.
   - Analyze the diff and generate a Conventional Commit message.
   - **Crucial**: Ask the user for confirmation before calling `git_commit`. Display the proposed message clearly.
   - If the user approves (e.g., "yes", "looks good"), call `git_commit` with the generated message.
