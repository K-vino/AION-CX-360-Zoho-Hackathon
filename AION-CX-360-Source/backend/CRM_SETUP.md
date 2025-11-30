# AION-CX 360° - CRM Integration Setup

## 🔑 OAuth Configuration
Ensure your `.env` file has the following keys:
```properties
ZOHO_CRM_CLIENT_ID=...
ZOHO_CRM_CLIENT_SECRET=...
ZOHO_CRM_REFRESH_TOKEN=...
ZOHO_CRM_BASE=https://www.zohoapis.com/crm/v2
```

## 🛠 Features Implemented
1.  **Auto-Lead Creation**: Visitors with a score > 20 are automatically pushed to Zoho CRM.
2.  **Duplicate Check**: Checks email before creating to avoid duplicates (Updates existing leads instead).
3.  **Smart Description**: Injects AI Summary, Scores, and Recommended Actions into the Lead Description field.
4.  **Transcript Notes**: Adds the full chat transcript as a "Note" attached to the Lead.

## 🧪 Testing the Integration
1.  **Restart Backend**: `node server.js`
2.  **Simulate Visitor**:
    ```bash
    curl -X POST http://localhost:3000/events/salesiq \
      -H "Content-Type: application/json" \
      -d '{"visitor_id": "test_crm_1", "name": "CRM Tester", "email": "crm@test.com", "budget_range": "1L+", "chat_transcript": "Testing CRM sync"}'
    ```
3.  **Verify**:
    *   Check backend console for "Lead created/updated".
    *   Go to **Zoho CRM** -> **Leads**.
    *   Find "CRM Tester".
    *   Check **Description** for AI stats.
    *   Check **Notes** for the transcript.
