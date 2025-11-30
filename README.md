# 🏆 AION-CX 360° — AI Revenue & Customer Intelligence OS

**The Ultimate AI-Powered SalesIQ Expansion for Zoho Cliqtrix**

---

## 🚀 Project Overview

**AION-CX 360°** is not just a chatbot—it is a complete **Revenue Intelligence Operating System** that transforms Zoho SalesIQ into a proactive sales engine. It uses **Google Gemini AI** to analyze visitor behavior, detect buying intent, and automate CRM actions in real-time.

### 🌟 Key Features
*   **🧠 AI Intent & Emotion Analysis**: Instantly detects if a visitor is "Ready to Buy", "Frustrated", or "Researching".
*   **🤖 Smart SalesIQ Bot**: Adaptive conversation flow that captures leads and qualifies them automatically.
*   **📊 Executive Dashboard**: Real-time view of live leads, pipeline health, and AI predictions.
*   **💼 Operator Intelligence Widget**: A "God Mode" panel for agents, showing visitor 360° profiles, AI insights, and CRM actions.
*   **🔗 Deep Zoho Integration**: Seamless sync with **Zoho CRM** and **Catalyst** Data Store.

---

## 📂 Folder Structure

*   `backend/`: Node.js/Express server powering the AI engine, database connections, and API endpoints.
*   `bot/`: The Zobot script (`zobot_script.js`) to be deployed in Zoho SalesIQ.
*   `widget/`: The Operator Intelligence Widget (`panel.html`) for the SalesIQ Operator interface.
*   `dashboard/`: The Executive Dashboard (`index.html`) for sales leaders.

---

## 🛠️ Setup Instructions

### 1. Backend Setup
1.  Navigate to `backend/`.
2.  Run `npm install` to install dependencies.
3.  Configure `.env` with your **Gemini API Key**, **Zoho CRM Credentials**, and **Catalyst** details.
4.  Run `node server.js` to start the server (default: Port 3000).
5.  Expose via ngrok: `ngrok http 3000`.

### 2. Bot Deployment
1.  Go to **Zoho SalesIQ** -> **Settings** -> **Zobot**.
2.  Create a new bot using **SalesIQ Scripts**.
3.  Copy the content of `bot/zobot_script.js`.
4.  Update the `BACKEND_URL` in the script with your ngrok URL.
5.  Publish the bot.

### 3. Widget Installation
1.  Go to **Zoho SalesIQ** -> **Settings** -> **Widgets**.
2.  Create a new **Web Widget**.
3.  Upload `widget/panel.html` or host it and provide the URL.
4.  Enable it for "Chat Window" and "Visitor History".

### 4. Dashboard Access
1.  Open `dashboard/index.html` in any modern browser.
2.  Ensure the backend is running to see live data.

---

## 🧪 Testing
See `TEST_PLAN.md` for detailed testing steps.

---

## 🎥 Demo
See `DEMO_SCRIPT.md` for the walkthrough script.

---

**Built with ❤️ for Zoho Cliqtrix**
