# 🧪 AION-CX 360° — Test Plan

Follow this guide to verify that all components are working correctly.

---

## 1. Backend Verification
*   **Goal**: Ensure the AI brain and Database are active.
*   **Steps**:
    1.  Start the server: `node backend/server.js`.
    2.  Open browser to `http://localhost:3000`.
    3.  **Expected**: You should see "AION Backend Running".
    4.  Test AI Endpoint: Send a POST to `/ai/rescore` (use Postman or curl) with a sample `visitor_id`.
    5.  **Expected**: JSON response with `lead_score` and `ai_summary`.

## 2. Bot Flow Test
*   **Goal**: Verify the Zobot captures data and adapts.
*   **Steps**:
    1.  Open the SalesIQ test window or your website.
    2.  Type "Hi".
    3.  **Expected**: Bot greets you as "General Assistant".
    4.  Type "I need enterprise pricing for 500 users".
    5.  **Expected**: Bot switches to "Pricing Navigator" persona and asks for budget/timeline.
    6.  Provide details.
    7.  **Expected**: Bot says "Analyzing..." and then "Analysis Complete" with a score.

## 3. Widget Functionality
*   **Goal**: Ensure the Operator sees the "God Mode" view.
*   **Steps**:
    1.  Log in to Zoho SalesIQ as an Operator.
    2.  Pick up the chat from Step 2.
    3.  Open the **AION Intelligence** widget in the sidebar.
    4.  **Expected**:
        *   Visitor Name, Email, Company populated.
        *   "AI Predictive Scores" showing high values (e.g., Intent > 80).
        *   "AI Analysis" showing "High Buying Intent".
    5.  Click "⚡ Re-score Lead".
    6.  **Expected**: Toast notification "Action Successful" and scores update.

## 4. Dashboard & CRM Sync
*   **Goal**: Verify the "Command Center" view.
*   **Steps**:
    1.  Open `dashboard/index.html`.
    2.  Go to **Live Leads** tab.
    3.  **Expected**: The new lead from Step 2 appears in the table with "Hot" status.
    4.  Go to **Pipeline** tab.
    5.  **Expected**: The lead appears as a card in the "Qualification" column.
    6.  Check Zoho CRM (if connected).
    7.  **Expected**: A new Lead record is created with the AI summary in the description.

---

## ✅ Success Criteria
*   Bot responds intelligently.
*   Widget shows real-time data.
*   Dashboard reflects new leads instantly.
*   CRM contains the lead data.
