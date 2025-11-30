const express = require('express');
const router = express.Router();
const { getAllLeads, saveLead } = require('../helpers/dbHelper');
const crm = require('../helpers/crm');

// POST /crm/syncAll
router.post('/syncAll', async (req, res) => {
    try {
        const leads = await getAllLeads();
        let syncedCount = 0;
        let errors = 0;

        for (const lead of leads) {
            // Only sync Hot/Warm or if explicitly requested
            // For "Sync All", we might sync everything or just qualified.
            // Let's sync everything that isn't already synced or needs update.
            if (lead.status === 'Hot' || lead.status === 'Warm') {
                const result = await crm.createOrUpdateLead(lead);
                if (result.success) {
                    lead.crm_lead_id = result.id;
                    lead.crm_url = `https://crm.zoho.com/crm/org${process.env.ZOHO_ORG_ID || ''}/tab/Leads/${result.id}`;
                    await saveLead(lead);
                    syncedCount++;
                } else {
                    errors++;
                }
            }
        }

        res.json({ success: true, synced: syncedCount, errors });
    } catch (error) {
        console.error("CRM Sync All Error:", error);
        res.status(500).json({ error: "Sync failed" });
    }
});

module.exports = router;
