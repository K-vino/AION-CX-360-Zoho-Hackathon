# Master Implementation Prompt: AION-CX 360° Finalization

**Role:** You are an Expert Full-Stack AI Engineer and Zoho Ecosystem Specialist.
**Objective:** Finalize the AION-CX 360° project by implementing ALL missing features, fixing ALL code gaps, and ensuring a 100% production-ready system.

---

## 🚀 PHASE 1: BOT INTELLIGENCE (SalesIQ Zobot)
**File:** `salesiq-bot/zobot_script.js`

1.  **Multi-Language Support:**
    *   Add language detection (English/Tamil).
    *   If user types in Tamil (or selects it), respond in Tamil.
    *   Store `session.language` in context.
2.  **Expanded Personas:**
    *   Ensure all 5 personas (Pricing, Sales, Support, Product, Enterprise) have distinct welcome messages and tone.
    *   Implement "Auto-Switch" logic based on keywords (e.g., "API" -> Tech Architect).
3.  **Data Collection:**
    *   Verify capture of: `name`, `email`, `phone`, `company`, `industry`, `budget`, `timeline`.
    *   Add `page_path` and `current_page` tracking from `context`.
4.  **Backend Sync:**
    *   Ensure `fetch(BACKEND_URL)` sends the full transcript and metadata.
    *   Handle timeouts gracefully with a "fallback" message.

## 🚀 PHASE 2: OPERATOR WIDGET (Frontend)
**File:** `frontend-widget/index.html` & `panel.html`

1.  **Feature Verification (42+ Items):**
    *   **Scores:** Ensure all 8 scores (Lead, Intent, Fit, Behavior, Urgency, Budget, Conversion, Churn) are visualized.
    *   **Actions:** Verify "Open CRM", "Draft Email", "Deal Strategy" buttons trigger the correct API calls.
    *   **Journey:** Ensure the "Heatmap" and "Timeline" render correctly with data from the backend.
2.  **UI Polish:**
    *   **Dark Mode:** Verify toggle works and persists.
    *   **Sticky Header:** Ensure it stays fixed on scroll.
    *   **Collapsible Cards:** Verify smooth slide animations.
3.  **Data Handling:**
    *   Implement "Select Visitor" dropdown to switch `visitor_id` dynamically.
    *   Ensure "Real-time Refresh" polls every 5s without flickering.

## 🚀 PHASE 3: EXECUTIVE DASHBOARD (Frontend)
**File:** `frontend-dashboard/index.html`

1.  **Pipeline Module:**
    *   **Stage Time Tracking:** Add a visual indicator of "Days in Stage" for each deal card.
    *   **Loss Reasons:** Add a dropdown/modal to select a reason when dragging to "Lost".
    *   **Value Sum:** Ensure the "Total Pipeline Value" updates instantly on drag-and-drop.
2.  **Live Leads Module:**
    *   **Filters:** Verify Industry, Stage, and Score filters work together.
    *   **Deep Link:** Ensure clicking a row opens the Widget with the correct `visitor_id`.
3.  **Settings Module:**
    *   **API URL:** Ensure saving the URL updates `localStorage` and applies immediately.
    *   **Data Tools:** Implement "Clear Cache" and "Seed Demo Data" buttons (mock logic is fine).

## 🚀 PHASE 4: BACKEND CORE (Node.js)
**File:** `backend/server.js` & `routes/*.js`

1.  **API Completeness:**
    *   `POST /events/salesiq`: Must parse Zobot payload and update `db.json`.
    *   `POST /crm/sync`: Must use `crmService` to push data to Zoho.
    *   `POST /ai/email`: Must use Gemini to generate email content.
2.  **Catalyst Integration:**
    *   Ensure `dbHelper.js` has a clear path to switch from JSON to Catalyst (even if commented out).
3.  **Stage Time Logic:**
    *   Update `pipeline.js` to track timestamp when a deal enters a new stage.

## 🚀 PHASE 5: ZOHO CRM & AI INTEGRATION

1.  **CRM Sync:**
    *   Ensure fields like `Lead Score`, `Intent`, and `Summary` are mapped to the CRM payload.
    *   Add logic to auto-tag leads as "Hot", "Warm", or "Cold" in CRM.
2.  **Gemini AI:**
    *   Verify prompts in `gemini.js` are robust and handle missing data gracefully.
    *   Ensure "Deal Strategy" provides actionable bullet points.

---

**Execution Instructions:**
*   **Step 1:** Apply fixes to `zobot_script.js` (Tamil support).
*   **Step 2:** Update `pipeline.js` and Dashboard for "Stage Time" and "Loss Reasons".
*   **Step 3:** Verify all UI animations and Dark Mode consistency.
*   **Step 4:** Run a full end-to-end test: Bot -> Backend -> Widget -> Dashboard -> CRM.

**Final Output:**
A fully polished, hackathon-winning codebase with zero missing features.
