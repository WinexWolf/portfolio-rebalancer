# Portfolio Rebalancer — MCP App

An AI-powered portfolio rebalancer built as an **MCP App** per the [MCP Apps Extension spec (SEP-1865)](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1865).

The app lives at `ui://portfolio/rebalancer` and communicates with its host via **MCP JSON-RPC 2.0 over `postMessage`** — the standardized transport described in the spec. Claude (via the Anthropic API) analyzes drift between current and target allocations and returns structured trade recommendations.

![Portfolio Rebalancer screenshot](./docs/screenshot.png)

---

## Features

- **Holdings management** — add/remove positions with live drift bars
- **Target allocation sliders** — per-asset sliders with total validation
- **Donut chart** — toggle between current vs target allocation views
- **Portfolio metrics** — total value, drift score, asset count, rebalance status
- **AI analysis** — Claude generates a narrative + structured trade list
- **Recommended trades** — BUY/SELL table with impact ratings (HIGH/MED/LOW)
- **Apply trades** — simulate executing the rebalance and update state
- **Export CSV** — download the trade list
- **MCP JSON-RPC log** — live view of all host ↔ app protocol messages

---

## Stack

- **React 18** + **Vite 5**
- **CSS Modules** (no CSS-in-JS, no Tailwind)
- Zero UI library dependencies — all components hand-rolled
- Anthropic API via `fetch` (no SDK needed in the browser)

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/portfolio-rebalancer.git
cd portfolio-rebalancer
npm install
```

### 2. Set up your API key

```bash
cp .env.example .env
```

Open `.env` and paste your Anthropic API key:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com/).

> **Note:** Vite exposes env vars prefixed with `VITE_` to the browser bundle.  
> For production use, proxy API calls through a backend to keep the key secret.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

---

## Project Structure

```
portfolio-rebalancer/
├── index.html
├── vite.config.js
├── .env.example
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # Root component — wires everything together
    ├── App.module.css
    ├── hooks/
    │   ├── useMcpBridge.js    # MCP JSON-RPC postMessage transport
    │   └── usePortfolio.js    # Portfolio state management
    ├── lib/
    │   ├── claudeApi.js       # Anthropic API call + prompt
    │   └── constants.js       # MCP URI, colors, sample data
    ├── components/
    │   ├── Card.jsx / .css
    │   ├── Settings.jsx / .css
    │   ├── Holdings.jsx / .css
    │   ├── TargetAllocation.jsx / .css
    │   ├── DonutChart.jsx / .css
    │   ├── Metrics.jsx / .css
    │   ├── AnalysisPanel.jsx / .css
    │   ├── TradesTable.jsx / .css
    │   └── McpLog.jsx / .css
    └── styles/
        └── globals.css        # CSS variables + resets
```

---

## MCP App Architecture

This app implements the [MCP Apps Extension](https://github.com/modelcontextprotocol/ext-apps) pattern:

| Concept | Implementation |
|---|---|
| Resource URI | `ui://portfolio/rebalancer` |
| Transport | `window.postMessage` (JSON-RPC 2.0) |
| Initialization | `notifications/initialized` on mount |
| Tool calls from host | `tools/call` → `load_portfolio` |
| Tool results to host | `tools/result` via `sendToHost()` |
| Resource updates | `resources/updated` on trades ready |

The `useMcpBridge` hook handles the full lifecycle. When embedded in an MCP-capable host (e.g. Claude.ai, a custom chat shell), the host can drive the app via tool calls over `postMessage`.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | ✅ | — | Your Anthropic API key |
| `VITE_CLAUDE_MODEL` | ❌ | `claude-sonnet-4-20250514` | Claude model to use |

---

## Security Note

This project calls the Anthropic API directly from the browser for simplicity. In production:

1. Create a thin backend proxy (Express, Next.js API route, etc.)
2. Store `ANTHROPIC_API_KEY` server-side only
3. Route `/api/analyze` through your backend

---

## License

MIT
