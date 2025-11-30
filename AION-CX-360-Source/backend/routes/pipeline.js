const express = require('express');
const router = express.Router();
const { getAllLeads, saveLead, getLeadByVisitorId } = require('../helpers/dbHelper');

// GET /pipeline/data
router.get('/data', async (req, res) => {
    try {
        const leads = await getAllLeads();
        // Ensure we return an array
        res.json(leads || []);
    } catch (error) {
        console.error("Pipeline Data Error:", error);
        res.status(500).json({ error: "Failed to fetch pipeline data" });
    }
});

// PATCH /pipeline/update
router.patch('/update', async (req, res) => {
    try {
        const { visitor_id, new_stage } = req.body;
        if (!visitor_id || !new_stage) {
            return res.status(400).json({ error: "Missing visitor_id or new_stage" });
        }

        // 1. Get existing lead
        const lead = await getLeadByVisitorId(visitor_id);
        if (!lead) {
            return res.status(404).json({ error: "Lead not found" });
        }

        // 2. Update stage (and status if needed)
        lead.crm_stage = new_stage;

        // Map stage to status for consistency
        if (['Won', 'Negotiation', 'Proposal Sent'].includes(new_stage)) {
            lead.status = 'Hot';
        } else if (['Qualified'].includes(new_stage)) {
            lead.status = 'Warm';
        } else if (['Lost'].includes(new_stage)) {
            lead.status = 'Cold';
        }

        // Track Stage Time
        lead.stage_updated_at = new Date().toISOString();

        // 3. Save
        await saveLead(lead);

        res.json({ success: true, lead });
    } catch (error) {
        console.error("Pipeline Update Error:", error);
        res.status(500).json({ error: "Failed to update pipeline" });
    }
});

module.exports = router;
