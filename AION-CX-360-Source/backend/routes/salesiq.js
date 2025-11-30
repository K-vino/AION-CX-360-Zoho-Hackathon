const express = require('express');
const router = express.Router();
const { calculateLeadScore, calculateIntentScore, calculateFitScore, calculateBehaviorScore, calculateUrgencyScore, calculateBudgetScore, calculateConversionProbability } = require('../helpers/leadScoring');
const { generateAISummary } = require('../helpers/gemini');
const { createOrUpdateLead, addLeadNote, createTask, createDeal } = require('../helpers/crm');
const { saveLead } = require('../helpers/dbHelper');

// === UPDATED FILE: backend/routes/salesiq.js ===

// POST /events/salesiq
router.post('/salesiq', async (req, res) => {
    try {
        const data = req.body;
        console.log("⚡ Received Real SalesIQ Event:", data.visitor_id || "Unknown");
        console.log("   Mode:", data.bot_mode || "Standard");

        // 1. Normalize Data
        const leadData = {
            visitor_id: data.visitor_id || `v_${Date.now()}`,
            name: data.name || "Guest",
            email: data.email || "",
            company: data.company || "",
            industry: data.industry || "Unknown",
            budget: data.budget || "",
            budget_range: data.budget_range || data.budget || "",
            timeline: data.timeline || "",
            use_case: data.use_case || "",
            chat_transcript: data.chat_transcript || "",
            pages_visited: data.pages_visited || [],
            source: data.source || "Direct",
            bot_mode: data.bot_mode || "Standard"
        };

        // 2. Calculate Scores
        const leadScore = calculateLeadScore(leadData);
        const intentScore = calculateIntentScore(leadData);
        const fitScore = calculateFitScore(leadData);
        const behaviorScore = calculateBehaviorScore(leadData);
        const urgencyScore = calculateUrgencyScore(leadData);
        const budgetScore = calculateBudgetScore(leadData);

        const conversionProb = calculateConversionProbability(leadScore, intentScore, fitScore);

        // Determine Status
        let status = 'Cold';
        if (conversionProb >= 0.7) status = 'Hot';
        else if (conversionProb >= 0.4) status = 'Warm';

        // 3. AI Analysis (Gemini)
        let aiResult = {};
        try {
            aiResult = await generateAISummary(leadData);
        } catch (aiError) {
            console.error("AI Analysis Failed (Continuing):", aiError.message);
            aiResult = {
                ai_summary: "AI Analysis unavailable.",
                ai_recommended_action: "Manual review required.",
                ai_risk_flags: [],
                ai_opportunity_notes: [],
                suggested_response: "How can I help you?",
                deep_insights: {}
            };
        }

        // 4. Construct Full Lead Object
        const fullLead = {
            ...leadData,
            lead_score: leadScore,
            intent_score: intentScore,
            fit_score: fitScore,
            behavior_score: behaviorScore,
            urgency_score: urgencyScore,
            budget_score: budgetScore,
            conversion_probability: parseFloat(conversionProb.toFixed(2)),
            churn_probability: parseFloat((1 - conversionProb).toFixed(2)), // Simple inverse
            status: status,

            // AI Fields
            ai_summary: aiResult.ai_summary,
            ai_recommended_action: aiResult.ai_recommended_action,
            ai_risk_flags: aiResult.ai_risk_flags || [],
            ai_opportunity_notes: aiResult.ai_opportunity_notes || [],
            suggested_response: aiResult.suggested_response,
            deep_insights: aiResult.deep_insights || {},

            // Meta
            updated_at: new Date().toISOString()
        };

        // 5. CRM Integration (Async - don't block response too long)
        // We await it here for simplicity in this demo, but in prod could be a queue.
        let crmId = null;
        if (leadScore >= 20) { // Only sync if decent score
            try {
                const crmResult = await createOrUpdateLead(fullLead);
                if (crmResult.success) {
                    crmId = crmResult.id;
                    fullLead.crm_lead_id = crmId;
                    fullLead.crm_url = `https://crm.zoho.com/crm/org${process.env.ZOHO_ORG_ID || ''}/tab/Leads/${crmId}`;

                    // A. Add Transcript
                    if (leadData.chat_transcript) {
                        await addLeadNote(crmId, `Chat Transcript:\n${leadData.chat_transcript}\n\nAI Analysis:\n${JSON.stringify(aiResult, null, 2)}`);
                    }

                    // B. Deal Autopilot (Hot Leads)
                    if (status === 'Hot') {
                        const taskSubject = `🔥 AION Alert: Follow up with ${leadData.name}`;
                        await createTask(crmId, taskSubject);
                        await createDeal(crmId, fullLead);
                    }
                }
            } catch (crmError) {
                console.error("CRM Sync Failed:", crmError.message);
            }
        }

        // 6. Save to Catalyst / DB
        await saveLead(fullLead);

        // 7. Response
        res.json({ success: true, lead: fullLead });

    } catch (error) {
        console.error("Error in SalesIQ route:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
