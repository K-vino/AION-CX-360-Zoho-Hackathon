const express = require('express');
const router = express.Router();
const gemini = require('../helpers/gemini');
const leadScoring = require('../helpers/leadScoring');
const { getLeadByVisitorId, saveLead } = require('../helpers/dbHelper');

// === UPDATED FILE: backend/routes/ai.js ===

// POST /ai/rescore
router.post('/rescore', async (req, res) => {
    try {
        const { visitor_id } = req.body;
        if (!visitor_id) return res.status(400).json({ error: "Missing visitor_id" });

        const lead = await getLeadByVisitorId(visitor_id);
        if (!lead) return res.status(404).json({ error: "Lead not found" });

        // Recalculate scores
        lead.lead_score = leadScoring.calculateLeadScore(lead);
        lead.intent_score = leadScoring.calculateIntentScore(lead);
        lead.fit_score = leadScoring.calculateFitScore(lead);
        lead.behavior_score = leadScoring.calculateBehaviorScore(lead);
        lead.urgency_score = leadScoring.calculateUrgencyScore(lead);
        lead.budget_score = leadScoring.calculateBudgetScore(lead);

        const conversionProb = leadScoring.calculateConversionProbability(lead.lead_score, lead.intent_score, lead.fit_score);
        lead.conversion_probability = parseFloat(conversionProb.toFixed(2));
        lead.churn_probability = parseFloat((1 - conversionProb).toFixed(2));

        // Update Status
        if (conversionProb >= 0.7) lead.status = 'Hot';
        else if (conversionProb >= 0.4) lead.status = 'Warm';
        else lead.status = 'Cold';

        // Save
        await saveLead(lead);

        res.json({ success: true, lead });
    } catch (error) {
        console.error("AI Rescore Error:", error.message);
        res.status(500).json({ error: "Rescore failed" });
    }
});

// POST /ai/email
router.post('/email', async (req, res) => {
    try {
        const { visitor_id, template_type } = req.body;
        if (!visitor_id) return res.status(400).json({ error: "Missing visitor_id" });

        const lead = await getLeadByVisitorId(visitor_id);
        if (!lead) return res.status(404).json({ error: "Lead not found" });

        // Generate real email using Gemini
        const emailContent = await gemini.generateSalesEmail(lead, template_type || 'intro');

        res.json(emailContent);
    } catch (error) {
        console.error("Email Route Error:", error.message);
        res.status(500).json({ error: "Email generation failed" });
    }
});

// POST /ai/suggest
router.post('/suggest', async (req, res) => {
    try {
        const { visitor_id } = req.body;
        if (!visitor_id) return res.status(400).json({ error: "Missing visitor_id" });

        const lead = await getLeadByVisitorId(visitor_id);
        if (!lead) return res.status(404).json({ error: "Lead not found" });

        // Simple rule-based suggestion for speed, or could call Gemini
        // For "Suggest Deal", we use logic:
        const amount = (lead.budget_range === "$100k+" || lead.budget === "$100k+") ? 100000 : 15000;

        const suggestion = {
            deal_name: `${lead.company || lead.name} - Enterprise License`,
            amount: amount,
            stage: "Qualification",
            probability: Math.round(lead.conversion_probability * 100),
            next_step: lead.ai_recommended_action || "Schedule Demo"
        };

        res.json(suggestion);
    } catch (error) {
        console.error("Suggestion Error:", error.message);
        res.status(500).json({ error: "Suggestion failed" });
    }
});

module.exports = router;
