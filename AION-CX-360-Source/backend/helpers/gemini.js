const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }); // Using latest fast model

// --- 1. Core Visitor Analysis (Real-time) ---
exports.generateAISummary = async (visitorData) => {
    try {
        const prompt = `
        You are AION — an enterprise-grade Customer Intelligence Engine built for Zoho SalesIQ and Zoho CRM.

        You will receive complete visitor data, chat transcript, and behavioral metrics.
        Your job is to think like a:
        • Sales Analyst
        • CX Expert
        • Marketing Strategist
        • Revenue Operations Brain
        • Behavioral Psychologist
        • Deal Closer

        You MUST produce extremely accurate, concise, and business-ready insights.

        ----------------------------
        INPUT DATA
        ----------------------------

        Visitor Profile:
        - Name: ${visitorData.name}
        - Email: ${visitorData.email}
        - Company: ${visitorData.company}
        - Industry: ${visitorData.industry}
        - Budget Range: ${visitorData.budget || visitorData.budget_range}
        - Timeline: ${visitorData.timeline}
        - Location: ${visitorData.location || "Unknown"}
        - Device: ${visitorData.device || "Unknown"}
        - Pages Visited: ${visitorData.pages_visited || 'Unknown'}
        - Time Spent: "Calculating..."
        - Previous Visits: "Calculating..."
        - Visitor Message / Use-case: ${visitorData.use_case}

        Chat Transcript:
        """
        ${visitorData.chat_transcript || 'No chat transcript available.'}
        """

        Existing AI Scores (optional):
        - lead_score: ${visitorData.lead_score || 'N/A'}
        - behavior_score: ${visitorData.behavior_score || 'N/A'}
        - intent_score: ${visitorData.intent_score || 'N/A'}
        - fit_score: ${visitorData.fit_score || 'N/A'}

        ----------------------------
        YOUR TASKS
        ----------------------------

        1. **AI Executive Summary (3 sentences max)**
        Explain who this lead is, what they want, and how serious they are.
        No filler words. No generic statements. Must be sales-friendly.

        2. **Buying Intent Detection (High / Medium / Low)**
        Based ONLY on the transcript and buyer signals.

        3. **Pain Points (3–5 bullets)**
        Extract what the user is struggling with, confused about, or trying to solve.

        4. **Opportunities (3–5 bullets)**
        Where is the buying potential? Upsell or cross-sell chances?
        Use real business logic.

        5. **Risks or Red Flags (if any)**
        Is the lead:
        - confused
        - budget-restricted
        - competitor-shopping
        - not ready
        - showing hesitation?

        If none, say: “No major risks detected.”

        6. **Sentiment Analysis**
        (Positive / Neutral / Negative)
        Use emotional tone + frustration detection.

        7. **Qualification Signals**
        Extract clear indicators:
        - urgency words (“immediately”, “ASAP”)
        - budget clues
        - authority clues
        - timeline clarity
        - purchasing power

        8. **Next Best Action (ONE sentence)**
        Be specific. Example:
        - “Schedule an enterprise demo within 24 hours.”
        - “Send pricing sheet with volume discount.”
        - “Assign a senior solutions consultant.”

        9. **Follow-up Recommendation (ONE sentence)**
        Cold? Nurture.  
        Warm? Engage.  
        Hot? Convert.  

        10. **Sales Email Suggestion (2-line micro email template)**
        Short, personalized, high-impact.

        ----------------------------
        OUTPUT FORMAT (STRICT JSON)
        ----------------------------

        {
          "ai_summary": "...",
          "buying_intent": "High/Medium/Low",
          "pain_points": ["...", "..."],
          "opportunities": ["...", "..."],
          "risks": ["...", "..."],
          "sentiment": "Positive/Neutral/Negative",
          "qualification_signals": ["...", "..."],
          "next_best_action": "...",
          "follow_up_recommendation": "...",
          "micro_email": "..."
        }

        Return ONLY valid JSON.
        Do not include explanations or markdown.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        // Map to internal structure
        return {
            ai_summary: data.ai_summary,
            ai_recommended_action: data.next_best_action,
            ai_risk_flags: data.risks,
            ai_opportunity_notes: data.opportunities,
            suggested_response: data.follow_up_recommendation, // Mapping follow-up to suggested response
            deep_insights: {
                pain_points: data.pain_points,
                buying_signals: data.qualification_signals, // Mapping qualification signals to buying signals
                objections: data.risks, // Mapping risks to objections
                workload_estimation: data.buying_intent // Using intent as proxy for workload/priority
            },
            sentiment_score: data.sentiment === "Positive" ? 85 : (data.sentiment === "Negative" ? 30 : 50),
            raw_data: data // Keep raw data for future use
        };

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return {
            ai_summary: "AI Analysis unavailable. High-value visitor detected. Please engage manually to qualify.",
            ai_recommended_action: "Engage manually and ask about budget.",
            ai_risk_flags: ["AI unavailable"],
            ai_opportunity_notes: ["Manual review required"],
            suggested_response: "How can I help you today?",
            deep_insights: {},
            sentiment_score: 50
        };
    }
};

// --- 2. Strategic Leadership Report (The Watcher) ---
exports.generateStrategicReport = async (stats) => {
    try {
        const prompt = `
        Act as the AION-CX Chief Revenue Officer AI.
        Analyze these real-time pipeline stats:

        - Total Leads: ${stats.total_leads}
        - Hot Leads: ${stats.hot}
        - Warm Leads: ${stats.warm}
        - Cold Leads: ${stats.cold}
        - Recent Activity: ${JSON.stringify(stats.latest.map(l => l.company).slice(0, 5))}

        Provide a "Live Pulse Report" for the VP of Sales.
        Output strictly in JSON:
        {
            "summary": "1-2 sentences on overall pipeline health and conversion trends.",
            "hot_lead_ratio": ${stats.hot / (stats.total_leads || 1)},
            "predicted_revenue_30d": "Estimate based on hot leads (assume $10k avg deal). Output number only.",
            "alerts": ["Array of strings", "e.g., 'Spike in enterprise traffic'", "Conversion drop in warm leads"]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Gemini Report Error:", error);
        return {
            summary: "Pipeline active. Data insufficient for deep analysis.",
            hot_lead_ratio: 0,
            predicted_revenue_30d: 0,
            alerts: ["System check required"]
        };
    }
};

// --- 3. AI Email Generator (The Closer) ---
exports.generateSalesEmail = async (leadData, templateType = "intro") => {
    try {
        const prompt = `
        You are a top-tier Enterprise Sales Development Rep (SDR).
        Write a personalized, high-conversion sales email for this lead.

        Lead Name: ${leadData.name}
        Company: ${leadData.company}
        Industry: ${leadData.industry}
        Pain Points: ${JSON.stringify(leadData.ai_pain_points || [])}
        Key Value Prop: AION-CX 360 (AI Revenue Intelligence)
        Goal: ${templateType === 'followup' ? 'Re-engage after silence' : 'Book a demo meeting'}

        Rules:
        - Keep it under 100 words.
        - No fluff.
        - Focus on their industry challenges.
        - Strong Call to Action (CTA).
        - Tone: Professional, confident, helpful.

        Output strictly JSON:
        {
            "subject": "Email Subject Line",
            "body": "Email Body Content"
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Gemini Email Error:", error);
        return {
            subject: `Meeting request: ${leadData.company} + AION`,
            body: `Hi ${leadData.name},\n\nI'd love to show you how AION can boost your revenue. Are you free for a quick chat?\n\nBest,\nAION Team`
        };
    }
};
