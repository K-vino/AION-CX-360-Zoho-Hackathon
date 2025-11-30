# AION-CX 360° - Zoho Catalyst Setup

To move from a local JSON database to the Enterprise-grade **Zoho Catalyst DataStore**, follow these steps.

## 1. Create Catalyst Project
1.  Go to [Zoho Catalyst Console](https://console.catalyst.zoho.com/).
2.  Create a new project (e.g., `aion-cx-360`).
3.  Note your **Project ID** (found in Settings -> General).

## 2. Enable DataStore & Create Table
1.  In the Catalyst Console, go to **Cloud Scale** -> **DataStore**.
2.  Click **Create Table**.
3.  **Table Name**: `aion_leads`
4.  **Columns**: Add the following columns (ensure types match):

| Column Name | Data Type |
| :--- | :--- |
| `visitor_id` | VarChar (Primary Key / Unique) |
| `name` | VarChar |
| `email` | VarChar |
| `company` | VarChar |
| `industry` | VarChar |
| `budget_range` | VarChar |
| `timeline` | VarChar |
| `use_case` | VarChar |
| `lead_score` | BigInt |
| `intent_score` | BigInt |
| `fit_score` | BigInt |
| `conversion_probability` | Double |
| `status` | VarChar |
| `ai_summary` | VarChar (Max Length) |
| `ai_recommended_action` | VarChar (Max Length) |
| `chat_transcript` | VarChar (Max Length) |
| `crm_lead_id` | VarChar |

*Note: `created_at` and `updated_at` are usually auto-managed by Catalyst, but you can add them if you want explicit control.*

## 3. Generate OAuth Credentials
Since we are connecting from a local Node.js server, we need OAuth credentials.
1.  Go to [Zoho API Console](https://api-console.zoho.com/).
2.  Create a **Self Client** (or reuse the one from CRM step).
3.  **Scope**: You need `ZohoCatalyst.tables.rows.CREATE`, `ZohoCatalyst.tables.rows.READ`, `ZohoCatalyst.tables.rows.UPDATE`, `ZohoCatalyst.projects.READ`.
4.  Generate a **Refresh Token** with these scopes.

## 4. Update .env
Add these to your `backend/.env` file:

```properties
CATALYST_PROJECT_ID=YOUR_PROJECT_ID
CATALYST_CLIENT_ID=YOUR_CLIENT_ID
CATALYST_CLIENT_SECRET=YOUR_CLIENT_SECRET
CATALYST_REFRESH_TOKEN=YOUR_REFRESH_TOKEN_WITH_CATALYST_SCOPES
CATALYST_BASE_URL=https://api.catalyst.zoho.com/baas/v1
```

## 5. Test
Restart your backend. The system will now read/write to Zoho Catalyst instead of `db.json`.
