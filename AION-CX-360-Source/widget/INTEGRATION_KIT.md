# 🚀 AION-CX 360° - Real Zoho Integration Kit

This guide explains how to replace the local simulators with **Real Zoho Services**.

---

## 1. 🌐 Expose Backend (Ngrok)
Since Zoho needs to talk to your local backend, you must expose it.
1.  Run: `ngrok http 3000`
2.  Copy the URL (e.g., `https://abcd-123.ngrok-free.app`).
3.  **Update Files**:
    *   `salesiq-bot/zobot_script.js`: Update `BACKEND_URL`.
    *   `frontend-widget/panel.html`: Update `API_URL`.

---

## 2. 🤖 Deploy SalesIQ Zobot
1.  Go to **Zoho SalesIQ** -> **Settings** -> **Zobots**.
2.  Click **Add Bot**.
3.  Choose **Platform**: **SalesIQ Scripts (JavaScript)**.
4.  Copy the code from `salesiq-bot/zobot_script.js`.
5.  Paste it into the editor.
6.  **Publish** the bot.

---

## 3. 🧩 Deploy Operator Widget
1.  Go to **Zoho SalesIQ** -> **Settings** -> **Widgets** (or "Custom Widgets").
2.  Click **Add Widget**.
3.  **Type**: Web / Iframe.
4.  **URL**: You need to host `frontend-widget/panel.html`.
    *   *Option A (Fast)*: Serve it via ngrok (`https://.../widget/panel.html`).
    *   *Option B (Catalyst)*: Upload to Catalyst Web Client.
5.  **Location**: "Operator Chat Panel" (Sidebar).
6.  **Save**.

---

## 4. 👥 CRM Integration
1.  Ensure your `backend/.env` has valid `ZOHO_CRM_REFRESH_TOKEN`.
2.  The backend will now automatically:
    *   Create Leads.
    *   Create Tasks (for Hot leads).
    *   Create Deals (for Enterprise budgets).

---

## 5. 🧪 Final Test
1.  Open your website (where SalesIQ is installed).
2.  Chat with the **Real Zobot**.
3.  Provide "Enterprise" details ($100k+ budget).
4.  **Check CRM**: See the Lead, Task, and Deal created.
5.  **Check Operator Console**: See the Widget load with "HOT" badge.

**You are now running on 100% Real Zoho Infrastructure.** 🥇
