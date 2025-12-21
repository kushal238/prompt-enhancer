# Prompt Engineer Extension

A Chrome extension that helps you write better prompts for LLMs like ChatGPT and Gemini.

## Setup

### 1. Start the Backend Server
The extension needs a local backend server to process prompts (currently mocks the response).

```bash
cd server
npm install
npm run dev
```
The server will start at `http://localhost:3000`.

### 2. Build the Extension
```bash
cd extension
npm install
npm run build
```

### 3. Load into Chrome
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top right.
3. Click **Load unpacked**.
4. Select the `extension/dist` folder from this project.

## Usage
1. Go to [ChatGPT](https://chatgpt.com) or [Gemini](https://gemini.google.com).
2. Click into the prompt text area.
3. A floating magic wand button (🪄) will appear near the input.
4. Type a prompt (e.g. "write email to boss") and click the wand.
5. Preview the enhanced prompt and click **Apply**.

