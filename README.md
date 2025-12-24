# neo-mcp

一個專為增強 Gemini CLI 體驗而設計的 Model Context Protocol (MCP) Server 擴充功能。

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
    *   `commands/git-commit.toml`: 儲存 Git Commit 的 Prompt 模板。

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
gemini extension install https://github.com/Benknightdark/neo-mcp
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

## 發布流程 (Release Process)

本專案配置了 GitHub Actions 自動化發布機制，只需建立並推送標籤即可觸發：

1.  **建立標籤**: 標籤必須以 `v` 開頭（例如 `v1.0.0`）。
    ```bash
    git tag v1.0.0
    ```
2.  **推送標籤**: 將標籤推送到 GitHub。
    ```bash
    git push origin v1.0.0
    ```
3.  **自動化發布**: GitHub Action 會自動執行建置、打包並建立一個包含資產 (`neo-mcp.zip`) 的 Release。

## 開發規範

為了確保專案的品質與一致性，所有開發者（包含 AI Agent）應遵循以下規範：

1.  **資深架構師思維 (Senior Architect Persona)**: 所有設計與代碼實現應追求簡潔、高效且具備良好的擴展性，避免過度工程或引入不必要的依賴。
2.  **Bun API 優先 (Bun First)**: 專案開發應優先採用 Bun 專屬 API（如 `Bun.spawn`, `Bun.file`）。僅在必要或相容性考量下才使用 Node.js 等效 API。
3.  **事實查核思維 (Fact-Check Thinking)**: 進行任何變更前，必須驗證檔案路徑、符號定義與系統狀態，嚴禁基於假設進行開發。
4.  **語意化提交 (Conventional Commits)**: 嚴格遵守 Conventional Commits 規範，確保 `git_commit` 功能生成的訊息精確反映邏輯變更。
5.  **Prompt 邏輯分離**: 所有的 Prompt 模板應統一管理於 `commands/` 目錄，透過靜態資源載入機制與伺服器邏輯解耦。
6.  **繁體中文優先**: 預設的互動語言、提示詞與說明文件應以繁體中文（台灣）為主。

## 目錄結構



*   `src/`: 原始碼目錄。

    *   `server.ts`: 伺服器主要邏輯。

*   `commands/`: 指令設定與 Prompt 模板。

    *   `git-commit.toml`: 智慧 Git 提交的 Prompt 模板。

*   `dist/`: 編譯後的輸出目錄 (由 build 產生)。

*   `gemini-extension.json`: 擴充功能清單檔案。

*   `GEMINI.md`: 專為 LLM/Agent 提供的操作標準與指令指南。
