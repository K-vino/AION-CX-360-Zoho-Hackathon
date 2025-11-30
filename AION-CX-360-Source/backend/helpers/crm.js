const axios = require('axios');
require('dotenv').config();

// === UPDATED FILE: backend/helpers/crm.js ===

// --- 1. OAuth Helper ---
const getAccessToken = async () => {
    try {
        const params = new URLSearchParams();
        params.append('refresh_token', process.env.ZOHO_CRM_REFRESH_TOKEN);
        params.append('client_id', process.env.ZOHO_CRM_CLIENT_ID);
        params.append('client_secret', process.env.ZOHO_CRM_CLIENT_SECRET);
        params.append('grant_type', 'refresh_token');

        const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', params);
        return response.data.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error.response ? error.response.data : error.message);
        // Return null to allow caller to handle gracefully (e.g. skip sync)
        return null;
    }
};

// --- 2. Create or Update Lead ---
exports.createOrUpdateLead = async (leadData) => {
    try {
        console.log("Syncing to Zoho CRM:", leadData.email);
        const accessToken = await getAccessToken();
        if (!accessToken) throw new Error("Authentication Failed");

        const headers = { 'Authorization': `Zoho-oauthtoken ${accessToken}` };

        // A. Search for existing lead
        const searchUrl = `${process.env.ZOHO_CRM_BASE}/Leads/search?email=${encodeURIComponent(leadData.email)}`;
        let leadId = null;

        try {
            const searchRes = await axios.get(searchUrl, { headers });
            if (searchRes.data.data && searchRes.data.data.length > 0) {
                leadId = searchRes.data.data[0].id;
                console.log("Lead found, updating ID:", leadId);
            }
        } catch (e) {
            // Ignore 204 No Content or search errors
        }

        // B. Prepare Payload
        const recordData = {
            Last_Name: leadData.name || "Unknown Visitor",
            Company: leadData.company || "Unknown Company",
            Email: leadData.email,
            Lead_Source: "AION-SalesIQ",
            Lead_Status: leadData.status === 'Hot' ? 'Contact in Future' : 'Attempted to Contact',
            Industry: leadData.industry,

            // Description holds the AI Intelligence
            Description: `
🔥 AION-CX 360 Intelligence Report
----------------------------------
• Status: ${leadData.status}
• Lead Score: ${leadData.lead_score}
• Intent Score: ${leadData.intent_score}
• Urgency Score: ${leadData.urgency_score}
• Conversion Probability: ${(leadData.conversion_probability * 100).toFixed(0)}%
• Churn Risk: ${(leadData.churn_probability * 100).toFixed(0)}%

🤖 AI Summary:
${leadData.ai_summary}

🚀 Recommended Action:
${leadData.ai_recommended_action}

⚠️ Risk Flags:
${(leadData.ai_risk_flags || []).join(', ')}

💡 Opportunity Notes:
${(leadData.ai_opportunity_notes || []).join(', ')}
            `
        };

        // C. Execute Create or Update
        if (leadId) {
            recordData.id = leadId;
            await axios.put(`${process.env.ZOHO_CRM_BASE}/Leads`, { data: [recordData] }, { headers });
            return { success: true, id: leadId, action: 'updated' };
        } else {
            const createRes = await axios.post(`${process.env.ZOHO_CRM_BASE}/Leads`, { data: [recordData] }, { headers });
            if (createRes.data.data[0].status === 'error') {
                throw new Error(JSON.stringify(createRes.data.data[0]));
            }
            const newId = createRes.data.data[0].details.id;
            return { success: true, id: newId, action: 'created' };
        }

    } catch (error) {
        console.error("CRM Sync Error:", error.response ? error.response.data : error.message);
        return { success: false, error: error.message };
    }
};

// --- 3. Add Note (Chat Transcript) ---
exports.addLeadNote = async (leadId, noteContent) => {
    try {
        const accessToken = await getAccessToken();
        if (!accessToken) return { success: false };

        const headers = { 'Authorization': `Zoho-oauthtoken ${accessToken}` };

        const noteData = {
            data: [
                {
                    Parent_Id: leadId,
                    se_module: "Leads",
                    Note_Title: "AION-CX Chat Transcript",
                    Note_Content: noteContent
                }
            ]
        };

        await axios.post(`${process.env.ZOHO_CRM_BASE}/Notes`, noteData, { headers });
        console.log("Note added to Lead:", leadId);
        return { success: true };

    } catch (error) {
        console.error("CRM Note Error:", error.message);
        return { success: false, error: error.message };
    }
};

// --- 4. Create Task (Deal Autopilot) ---
exports.createTask = async (leadId, subject) => {
    try {
        const accessToken = await getAccessToken();
        if (!accessToken) return { success: false };

        const headers = { 'Authorization': `Zoho-oauthtoken ${accessToken}` };

        const taskData = {
            data: [
                {
                    Subject: subject,
                    Who_Id: leadId, // Link to Lead
                    se_module: "Leads",
                    Status: "Not Started",
                    Priority: "High",
                    Due_Date: new Date().toISOString().split('T')[0] // Due Today
                }
            ]
        };

        await axios.post(`${process.env.ZOHO_CRM_BASE}/Tasks`, taskData, { headers });
        console.log("Task created for Lead:", leadId);
        return { success: true };

    } catch (error) {
        console.error("CRM Task Error:", error.message);
        return { success: false, error: error.message };
    }
};

// --- 5. Create Deal (Revenue Autopilot) ---
exports.createDeal = async (leadId, leadData) => {
    try {
        const accessToken = await getAccessToken();
        if (!accessToken) return { success: false };

        const headers = { 'Authorization': `Zoho-oauthtoken ${accessToken}` };

        // Estimate Amount
        let amount = 5000;
        if (leadData.budget === "$100k+" || leadData.budget_range === "$100k+") amount = 100000;
        else if (leadData.budget === "$10k+" || leadData.budget_range === "$10k+") amount = 15000;

        const dealData = {
            data: [
                {
                    Deal_Name: `${leadData.company} - Enterprise Plan`,
                    Stage: "Qualification",
                    Amount: amount,
                    Closing_Date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
                    Account_Name: leadData.company, // Note: Accounts must exist or this might need handling
                    Lead_Source: "AION-CX AI",
                    Description: "Auto-created by AION-CX 360 Deal Autopilot."
                }
            ]
        };

        await axios.post(`${process.env.ZOHO_CRM_BASE}/Deals`, dealData, { headers });
        console.log("Deal created for:", leadData.company);
        return { success: true };

    } catch (error) {
        // Deals often fail if Account doesn't exist. We swallow this error for demo stability.
        console.warn("CRM Deal Creation Warning (Account might be missing):", error.response ? error.response.data : error.message);
        return { success: false };
    }
};
