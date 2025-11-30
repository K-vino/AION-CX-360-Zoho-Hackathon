# 🚀 AION-CX 360° v3 — Final Deployment Guide

This is the master guide to deploy the **Enterprise Edition (v3)** of AION-CX 360° using real Zoho services and a live public URL.

---

## 🛠️ Phase 1: Backend & Connectivity

### 1. Start the Backend
Open a terminal in `backend/` and run:
```bash
node server.js
```
*Ensure it says: "AION Backend Running on http://localhost:3001"*

### 2. Start Ngrok (Public Tunnel)
Open a **new** terminal and run:
```bash
ngrok http 3001
```
*Copy your Forwarding URL (e.g., `https://abcd-123.ngrok-free.app`).*

### 3. Update Code Placeholders
Perform a **Find & Replace** in your project folder:
*   **Find**: `<MY_NGROK_URL>`
*   **Replace**: Your actual ngrok URL (without `https://` if the code already has it, or with it if needed. **Check the files!**)

**Files to Check:**
1.  `salesiq-bot/zobot_script.js` (Line 5) -> `https://abcd-123.ngrok-free.app/events/salesiq`
2.  `frontend-widget/panel.html` (Line 85) -> `https://abcd-123.ngrok-free.app`
3.  `frontend-dashboard/index.html` (Line 178) -> `https://abcd-123.ngrok-free.app`

---

## 🤖 Phase 2: SalesIQ Bot Deployment (Real Zobot)

1.  Login to **Zoho SalesIQ**.
2.  Go to **Settings** -> **Zobots**.
3.  Click **Add Bot**.
4.  **Name**: "AION Intelligence".
5.  **Platform**: Choose **SalesIQ Scripts (JavaScript)**.
6.  **Code**: Copy EVERYTHING from `salesiq-bot/zobot_script.js` and paste it into the editor.
7.  **Publish** the bot.

---

## 🧩 Phase 3: Operator Widget Deployment

1.  Go to **Zoho SalesIQ** -> **Settings** -> **Widgets** (or "Custom Widgets").
2.  Click **Add Widget**.
3.  **Type**: Web / Iframe.
4.  **Name**: "AION Operator Panel".
5.  **URL**: `https://abcd-123.ngrok-free.app/frontend-widget/panel.html` (Use your ngrok URL).
6.  **Location**: Select **Operator Chat Panel** (Sidebar).
7.  **Save**.

---

## 📊 Phase 4: Dashboard Setup

1.  Open your browser.
2.  Go to: `https://abcd-123.ngrok-free.app/frontend-dashboard/index.html`
3.  You should see the **Executive Dashboard** loading live data.

---

## 🧪 Phase 5: The "Judge-Winning" Demo Flow

1.  **Open 3 Tabs**:
    *   Tab 1: **Dashboard** (Live View).
    *   Tab 2: **Zoho CRM** (Leads Module).
    *   Tab 3: **Incognito Window** (Your Website with the Bot).

2.  **Action**:
    *   In Incognito, chat with the bot.
    *   Say: "I am Tony Stark from Stark Industries."
    *   Say: "Budget is $100k+." (Trigger **HOT** status).

3.  **Witness the Magic**:
    *   **Bot**: Says "Analyzing..." and "An operator has been notified."
    *   **Dashboard**: "Hot Leads" counter increments instantly. "Tony Stark" appears in the table.
    *   **CRM**: Refresh Leads. "Tony Stark" is created with **AI Summary** and **Chat Transcript**.
    *   **Operator Console**: (If you open SalesIQ) The Widget shows "🔥 HOT LEAD" and "Recommended Action: Schedule Demo".

---

## ⚠️ Troubleshooting

*   **CORS Error?** Ensure `server.js` has `app.use(cors())`.
*   **Bot not replying?** Check `node server.js` terminal for logs.
*   **Widget 404?** Ensure you updated the URL in SalesIQ Settings to the ngrok URL.
*   **CRM not creating?** Check `.env` for valid `REFRESH_TOKEN`.

**System Status: v3 ENTERPRISE READY** 🚀
