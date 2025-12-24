# Neo Gemini Extension (Neo Tools)

**Neo Gemini Extension** (亦稱為 "Neo Tools") 是一個專為增強 Gemini CLI 體驗而設計的 Model Context Protocol (MCP) Server 擴充功能。本專案採用高效能的 **Bun** 執行環境與 **TypeScript** 構建，目前專注於自動化 Git 工作流程。

此擴充功能透過 MCP SDK 與 Gemini 整合，提供專門的 Prompt，利用本地系統工具（如 `git`）執行任務並生成具備上下文感知的高品質回應。

## 主要功能

*   **智慧 Git 提交 (`git_commit`)**:
    *   **自動暫存**：自動執行 `git add .` 將所有變更加入暫存區。
    *   **變更分析**：分析暫存區的變更內容 (`git diff --staged`)。
    *   **高品質訊息**：扮演「資深架構師」角色，生成符合 Conventional Commits 規範的提交訊息。
    *   **繁體中文支援**：預設輸出繁體中文（台灣）的提交說明。

## 系統架構

*   **執行環境**: [Bun](https://bun.com) (v1.3.2+)
*   **框架**: `@modelcontextprotocol/sdk`
*   **進入點**:
    *   原始碼: `src/server.ts`
    *   發布檔: `dist/server.js`
*   **設定檔**:
    *   `gemini-extension.json`: 定義 MCP server 的配置。
    *   `src/prompts.toml`: 儲存 Prompt 模板，確保邏輯與文字分離。

## 建置與執行

### 前置需求

*   請先安裝 Bun (`curl -fsSL https://bun.sh/install | bash`)

### 安裝依賴

```bash
bun install
```

### 安裝擴充功能 (Install Extension)

若要將此擴充功能安裝至 Gemini CLI，請在專案根目錄執行：

```bash
gemini install .
```

或者從 GitHub 遠端安裝：

```bash
gemini install github.com/Benknightdark/neo-gemini-extension
```

### 常用指令

*   **建置 (Build)**: 清理 `dist/` 目錄，打包伺服器程式碼並複製資源檔。
    ```bash
    bun run build
    ```
*   **開發模式 (Development)**: 直接從原始碼執行伺服器。
    ```bash
    bun dev
    ```
*   **生產模式 (Production)**: 執行建置後的伺服器。
    ```bash
    bun start
    ```
*   **型別檢查 (Typecheck)**:
    ```bash
    bun run typecheck
    ```

## 開發規範

1.  **Bun First**: 專案依賴 Bun 專屬 API (如 `Bun.spawnSync`, `Bun.file`, `Bun.TOML`) 進行檔案系統與處理程序操作。除非必要，否則請勿使用 Node.js 等效 API。
2.  **MCP 模式**: 遵循 MCP SDK 模式：
    *   初始化 `McpServer`。
    *   透過 `server.registerPrompt` 註冊功能。
    *   使用 `StdioServerTransport` 進行連接。
3.  **Prompt 管理**:
    *   複雜的 Prompt 模板儲存於 `src/prompts.toml`。
    *   伺服器在執行時讀取此檔案。
4.  **語言**: 目前 Prompt 設計主要針對繁體中文使用者。

## 目錄結構

*   `src/`: 原始碼目錄。
    *   `server.ts`: 伺服器主要邏輯。
    *   `prompts.toml`: Prompt 模板設定檔。
*   `dist/`: 編譯後的輸出目錄 (由 build 產生)。
*   `gemini-extension.json`: 擴充功能清單檔案。
*   `BUN_CONTEXT.md`: 專為 LLM/Agent 提供的上下文說明文件。