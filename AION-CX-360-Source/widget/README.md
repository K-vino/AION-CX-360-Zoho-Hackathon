# AION-CX 360° Operator Widget (Enterprise Edition)

## 🚀 Overview
This is the **Operator Intelligence Panel** for AION-CX 360°. It displays real-time visitor scoring, AI insights, and CRM data directly to the support agent.

## 📂 Files
- `index.html`: The main widget file (Enterprise UI).
- `panel.html`: A clone of `index.html` for specific SalesIQ deployment slots if needed.
- `manifest.json`: Configuration for Zoho Marketplace/Widget loader.

## 🧪 How to Test Locally
1. **Start Backend**: Ensure `node server.js` is running in `../backend`.
2. **Open Widget**: Open `index.html` in your browser.
3. **Simulate Visitor**:
   - By default, it uses a demo ID.
   - To test a specific visitor, append `?visitor_id=YOUR_ID` to the URL.
   - Example: `file:///.../index.html?visitor_id=v_123456`

## 🔗 SalesIQ Deployment
1. Go to **Zoho SalesIQ** -> **Settings** -> **Widgets**.
2. Create a **Custom Widget**.
3. Upload `index.html` (or copy-paste the code).
4. **Important**: Ensure the `API_URL` in the script points to your **Ngrok** (public) URL, not `localhost`.

## 🛠 Features
- **Predictive Scoring**: Lead, Intent, Fit scores.
- **AI Analysis**: Real-time Gemini summaries and recommended actions.
- **CRM Deep Link**: One-click access to Zoho CRM records.
- **Smart Actions**: Draft Email, Rescore, Copy Info.
