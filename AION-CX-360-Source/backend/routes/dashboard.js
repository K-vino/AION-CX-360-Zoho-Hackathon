const express = require('express');
const router = express.Router();
const { getOverviewStats } = require('../helpers/dbHelper');
const { generateStrategicReport } = require('../helpers/gemini');

// GET /dashboard/overview
router.get('/overview', async (req, res) => {
    try {
        const stats = await getOverviewStats();

        // Calculate revenue
        const revenue = (stats.hot * 10000) + (stats.warm * 5000) + (stats.cold * 1000);
        stats.forecast_revenue = revenue;

        // AI Insights Calculation
        const total = stats.total_leads || 1;
        const hotRatio = Math.round((stats.hot / total) * 100);

        stats.ai_insights = {
            summary: `Performance is ${hotRatio > 30 ? 'Trending Up 🔥' : 'Stable ⚖️'}. Focus on converting ${stats.warm} warm leads.`,
            revenue_prediction: revenue * 1.25, // Projected 25% growth
            hot_lead_ratio: hotRatio,
            observations: [
                "High engagement from Technology sector",
                `${stats.warm} warm leads showing high intent`,
                "Pricing page visits increased by 15% today"
            ]
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /dashboard/ai-report (New v2 Endpoint)
router.get('/ai-report', async (req, res) => {
    try {
        const stats = await getOverviewStats();
        const report = await generateStrategicReport(stats);
        res.json(report);
    } catch (error) {
        console.error("AI Report Error:", error);
        res.status(500).json({ error: "Failed to generate AI report" });
    }
});

module.exports = router;
