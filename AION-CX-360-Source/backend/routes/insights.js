const express = require('express');
const router = express.Router();
const { getLeadByVisitorId } = require('../helpers/dbHelper');

// GET /insights/:visitor_id
router.get('/:visitor_id', async (req, res) => {
    try {
        const visitorId = req.params.visitor_id;
        const lead = await getLeadByVisitorId(visitorId);

        if (lead) {
            // Construct response to match widget requirements
            const response = {
                visitor_id: lead.visitor_id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone || "+1 (555) 123-4567", // Mock if missing
                company: lead.company,
                industry: lead.industry,
                location: lead.location || "San Francisco, USA", // Mock
                budget: lead.budget_range || lead.budget,
                timeline: lead.timeline,

                // Scores
                lead_score: lead.lead_score,
                behavior_score: lead.behavior_score || 75,
                intent_score: lead.intent_score,
                fit_score: lead.fit_score,
                conversion_probability: lead.conversion_probability,
                emotion: lead.lead_score > 70 ? "Positive" : (lead.lead_score > 40 ? "Neutral" : "Concerned"),

                // AI Intelligence
                ai_summary: lead.ai_summary,
                ai_action: lead.ai_recommended_action,
                ai_risk: "Competitor evaluating similar solution", // Mock
                ai_opportunity: "High upsell potential for Q4", // Mock

                // Journey (Mock for demo)
                journey: [
                    { page: "Pricing", time: "2m 30s" },
                    { page: "Case Studies", time: "5m 12s" },
                    { page: "Home", time: "1m 05s" }
                ],

                // CRM Integration
                crm_status: lead.status,
                crm_owner: "Sarah Connor", // Mock
                crm_stage: "Qualification", // Mock
                crm_tags: ["Enterprise", "High Value"], // Mock
                crm_url: (lead.crm_lead_id && lead.crm_lead_id !== 'mock_id') ?
                    `https://crm.zoho.com/crm/${process.env.ZOHO_CRM_ORG_ID ? process.env.ZOHO_CRM_ORG_ID + '/' : ''}tab/Leads/${lead.crm_lead_id}` :
                    "https://crm.zoho.com/crm/tab/Leads"
            };
            res.json(response);
        } else {
            res.status(404).json({ error: "Visitor not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
