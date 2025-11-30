const axios = require('axios');
require('dotenv').config();

// --- Configuration ---
const PROJECT_ID = process.env.CATALYST_PROJECT_ID;
const TABLE_NAME = 'aion_leads';
const BASE_URL = process.env.CATALYST_BASE_URL || 'https://api.catalyst.zoho.com/baas/v1';

// --- OAuth Helper for Catalyst ---
const getCatalystToken = async () => {
    try {
        const params = new URLSearchParams();
        params.append('refresh_token', process.env.CATALYST_REFRESH_TOKEN || process.env.ZOHO_CRM_REFRESH_TOKEN);
        params.append('client_id', process.env.CATALYST_CLIENT_ID || process.env.ZOHO_CRM_CLIENT_ID);
        params.append('client_secret', process.env.CATALYST_CLIENT_SECRET || process.env.ZOHO_CRM_CLIENT_SECRET);
        params.append('grant_type', 'refresh_token');

        const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', params);
        return response.data.access_token;
    } catch (error) {
        console.error("Error fetching Catalyst token:", error.response ? error.response.data : error.message);
        // Don't throw, just return null so we can fallback
        return null;
    }
};

// --- DB Operations ---

// 1. Save Lead (Insert or Update)
exports.saveLead = async (leadData) => {
    try {
        const token = await getCatalystToken();

        // If no token (e.g. not configured), force fallback
        if (!token) throw new Error("No Catalyst Token available");

        const headers = {
            'Authorization': `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
        };

        // Check if exists
        const query = `SELECT ROWID FROM ${TABLE_NAME} WHERE visitor_id = '${leadData.visitor_id}'`;
        const searchUrl = `${BASE_URL}/projects/${PROJECT_ID}/search?query=${encodeURIComponent(query)}`;

        let existingRowId = null;
        try {
            const searchRes = await axios.get(searchUrl, { headers });
            if (searchRes.data.content && searchRes.data.content.length > 0) {
                existingRowId = searchRes.data.content[0].aion_leads.ROWID;
            }
        } catch (e) {
            // Ignore search error, assume new
        }

        const rowData = {
            visitor_id: leadData.visitor_id,
            name: leadData.name,
            email: leadData.email,
            company: leadData.company,
            industry: leadData.industry,
            budget_range: leadData.budget_range || leadData.budget,
            timeline: leadData.timeline,
            use_case: leadData.use_case,

            // Scores
            lead_score: leadData.lead_score,
            intent_score: leadData.intent_score,
            fit_score: leadData.fit_score,
            behavior_score: leadData.behavior_score,
            urgency_score: leadData.urgency_score,
            conversion_probability: leadData.conversion_probability,
            churn_probability: leadData.churn_probability,
            status: leadData.status, // Hot/Warm/Cold

            // AI Outputs
            ai_summary: leadData.ai_summary,
            ai_recommended_action: leadData.ai_recommended_action,
            ai_risk_flags: JSON.stringify(leadData.ai_risk_flags || []),
            ai_opportunity_notes: JSON.stringify(leadData.ai_opportunity_notes || []),

            // Meta & CRM
            chat_transcript: leadData.chat_transcript,
            crm_lead_id: leadData.crm_lead_id,
            crm_status: leadData.crm_status,
            crm_owner: leadData.crm_owner,
            crm_stage: leadData.crm_stage,
            crm_url: leadData.crm_url,

            updated_at: new Date().toISOString()
        };

        if (existingRowId) {
            // Update
            const updateUrl = `${BASE_URL}/projects/${PROJECT_ID}/table/${TABLE_NAME}/row/${existingRowId}`;
            await axios.put(updateUrl, rowData, { headers });
            console.log("Catalyst: Updated row", existingRowId);
        } else {
            // Insert
            rowData.created_at = new Date().toISOString();
            const insertUrl = `${BASE_URL}/projects/${PROJECT_ID}/table/${TABLE_NAME}/row`;
            await axios.post(insertUrl, rowData, { headers });
            console.log("Catalyst: Inserted new row");
        }

    } catch (error) {
        console.error("Catalyst Save Error (Using Fallback):", error.message);
        // Fallback to local file if Catalyst fails (for reliability during demo)
        const fs = require('fs');
        const localData = fs.existsSync('db.json') ? JSON.parse(fs.readFileSync('db.json')) : {};

        // Merge with existing
        const existing = localData[leadData.visitor_id] || {};
        localData[leadData.visitor_id] = { ...existing, ...leadData, updated_at: new Date().toISOString() };

        fs.writeFileSync('db.json', JSON.stringify(localData, null, 2));
        console.log("Fallback: Saved to local db.json");
    }
};

// 2. Get Lead by Visitor ID
exports.getLeadByVisitorId = async (visitorId) => {
    try {
        const token = await getCatalystToken();
        if (!token) throw new Error("No Catalyst Token");

        const headers = { 'Authorization': `Zoho-oauthtoken ${token}` };

        // ZCQL Query
        const query = `SELECT * FROM ${TABLE_NAME} WHERE visitor_id = '${visitorId}'`;
        const url = `${BASE_URL}/projects/${PROJECT_ID}/search?query=${encodeURIComponent(query)}`;

        const response = await axios.get(url, { headers });

        if (response.data.content && response.data.content.length > 0) {
            const data = response.data.content[0].aion_leads;
            // Parse JSON fields
            try { data.ai_risk_flags = JSON.parse(data.ai_risk_flags); } catch (e) { }
            try { data.ai_opportunity_notes = JSON.parse(data.ai_opportunity_notes); } catch (e) { }
            return data;
        }
        return null;

    } catch (error) {
        // Fallback
        const fs = require('fs');
        if (fs.existsSync('db.json')) {
            const data = JSON.parse(fs.readFileSync('db.json'));
            return data[visitorId] || null;
        }
        return null;
    }
};

// 3. Get Overview Stats
exports.getOverviewStats = async () => {
    try {
        const token = await getCatalystToken();
        if (!token) throw new Error("No Catalyst Token");

        const headers = { 'Authorization': `Zoho-oauthtoken ${token}` };

        // Fetch all (Limit 100 for demo)
        const query = `SELECT * FROM ${TABLE_NAME} LIMIT 100`;
        const url = `${BASE_URL}/projects/${PROJECT_ID}/search?query=${encodeURIComponent(query)}`;

        const response = await axios.get(url, { headers });
        const rows = response.data.content ? response.data.content.map(c => c.aion_leads) : [];

        // Process rows
        const processedRows = rows.map(r => {
            try { r.ai_risk_flags = JSON.parse(r.ai_risk_flags); } catch (e) { }
            return r;
        });

        const total = processedRows.length;
        const hot = processedRows.filter(r => r.status === 'Hot').length;
        const warm = processedRows.filter(r => r.status === 'Warm').length;
        const cold = processedRows.filter(r => r.status === 'Cold').length;

        // Sort by created time (desc)
        const recent = processedRows.reverse().slice(0, 10);

        return {
            total_leads: total,
            hot: hot,
            warm: warm,
            cold: cold,
            latest: recent
        };

    } catch (error) {
        // Fallback
        const fs = require('fs');
        if (fs.existsSync('db.json')) {
            const leads = Object.values(JSON.parse(fs.readFileSync('db.json')));
            return {
                total_leads: leads.length,
                hot: leads.filter(l => l.status === 'Hot').length,
                warm: leads.filter(l => l.status === 'Warm').length,
                cold: leads.filter(l => l.status === 'Cold').length,
                latest: leads.slice(-10).reverse()
            };
        }
        return { total_leads: 0, hot: 0, warm: 0, cold: 0, latest: [] };
    }
};
// 4. Get All Leads (For Pipeline)
exports.getAllLeads = async () => {
    try {
        const token = await getCatalystToken();
        if (!token) throw new Error("No Catalyst Token");

        const headers = { 'Authorization': `Zoho-oauthtoken ${token}` };

        // Fetch all (Limit 500)
        const query = `SELECT * FROM ${TABLE_NAME} LIMIT 500`;
        const url = `${BASE_URL}/projects/${PROJECT_ID}/search?query=${encodeURIComponent(query)}`;

        const response = await axios.get(url, { headers });
        const rows = response.data.content ? response.data.content.map(c => c.aion_leads) : [];

        return rows.map(r => {
            try { r.ai_risk_flags = JSON.parse(r.ai_risk_flags); } catch (e) { }
            try { r.ai_opportunity_notes = JSON.parse(r.ai_opportunity_notes); } catch (e) { }
            return r;
        });

    } catch (error) {
        // Fallback
        const fs = require('fs');
        if (fs.existsSync('db.json')) {
            return Object.values(JSON.parse(fs.readFileSync('db.json')));
        }
        return [];
    }
};

