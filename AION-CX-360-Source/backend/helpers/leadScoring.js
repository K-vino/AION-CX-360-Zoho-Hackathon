// AION-CX 360° - Enterprise Lead Scoring Engine v2

// 1. Lead Score (Demographic & Firmographic)
exports.calculateLeadScore = (data) => {
    let score = 0;

    // Budget
    if (data.budget_range === "$100k+" || data.budget === "$100k+") score += 30;
    else if (data.budget_range === "$10k+" || data.budget === "$10k+") score += 20;
    else score += 10;

    // Timeline
    if (data.timeline === "Immediate") score += 25;
    else if (data.timeline === "1-3 Months") score += 15;
    else score += 5;

    // Industry (Target Industries)
    const targetIndustries = ["SaaS", "Finance", "Healthcare", "Enterprise", "Technology"];
    if (targetIndustries.includes(data.industry)) score += 15;

    // Completeness
    if (data.email && data.email.includes("@")) score += 10;
    if (data.company) score += 10;
    if (data.use_case && data.use_case.length > 10) score += 10;

    return Math.min(score, 100);
};

// 2. Intent Score (Behavioral & Contextual)
exports.calculateIntentScore = (data) => {
    let score = 50; // Base intent

    // Keyword Analysis in Use Case & Transcript
    const highIntentKeywords = ["buy", "price", "cost", "demo", "enterprise", "urgent", "immediate", "contract", "sign"];
    const text = (data.use_case + " " + (data.chat_transcript || "")).toLowerCase();

    highIntentKeywords.forEach(word => {
        if (text.includes(word)) score += 5;
    });

    // Page Context (Simulated)
    if (data.pages_visited && data.pages_visited.includes("pricing")) score += 20;
    if (data.pages_visited && data.pages_visited.includes("demo")) score += 15;

    return Math.min(score, 100);
};

// 3. Fit Score (ICP Match)
exports.calculateFitScore = (data) => {
    let score = 0;

    // Company Size / Type (Simulated based on name/email)
    if (data.email && !data.email.includes("gmail.com") && !data.email.includes("yahoo.com") && !data.email.includes("hotmail.com")) {
        score += 40; // Corporate email
    } else {
        score += 10;
    }

    if (data.company && data.company.length > 2) score += 30;
    if (["SaaS", "Technology", "Finance", "Enterprise"].includes(data.industry)) score += 30;

    return Math.min(score, 100);
};

// 4. Behavior Score (Digital Body Language)
exports.calculateBehaviorScore = (data) => {
    let score = 50;
    // In a real app, this would use time_on_site, scroll_depth, etc.
    if (data.timeline === "Immediate") score += 20;
    if (data.budget === "$100k+") score += 20;
    if (data.pages_visited && data.pages_visited.length > 2) score += 10;
    return Math.min(score, 100);
};

// 5. Urgency Score (New)
exports.calculateUrgencyScore = (data) => {
    let score = 30;
    const urgentKeywords = ["asap", "urgent", "immediately", "now", "today", "deadline"];
    const text = (data.use_case + " " + (data.chat_transcript || "")).toLowerCase();

    if (data.timeline === "Immediate") score += 40;
    if (data.timeline === "1-3 Months") score += 20;

    urgentKeywords.forEach(word => {
        if (text.includes(word)) score += 10;
    });

    return Math.min(score, 100);
};

// 6. Conversion Probability (Weighted Function)
exports.calculateConversionProbability = (leadScore, intentScore, fitScore) => {
    // Weighted average: Fit (40%) + Intent (40%) + Lead (20%)
    const probability = (fitScore * 0.4) + (intentScore * 0.4) + (leadScore * 0.2);
    return parseFloat((probability / 100).toFixed(2));
};

// 7. Churn Probability (Inverse of Fit/Intent)
exports.calculateChurnProbability = (fitScore, intentScore) => {
    const stability = (fitScore + intentScore) / 2;
    const churnRisk = 100 - stability;
    return parseFloat((churnRisk / 100).toFixed(2));
};

// 8. Budget Score (Financial Capacity)
exports.calculateBudgetScore = (data) => {
    let score = 20; // Base
    const budget = (data.budget || data.budget_range || "").toLowerCase();

    if (budget.includes("100k") || budget.includes("enterprise")) score = 95;
    else if (budget.includes("50k") || budget.includes("10k")) score = 75;
    else if (budget.includes("5k") || budget.includes("1k")) score = 50;
    else if (budget.includes("low") || budget.includes("cheap")) score = 10;

    return score;
};

// 9. Sentiment Score (Emotional Tone)
exports.calculateSentimentScore = (data) => {
    let score = 50; // Neutral
    const text = (data.use_case + " " + (data.chat_transcript || "")).toLowerCase();

    const positive = ["great", "love", "perfect", "excited", "interested", "help", "thanks", "good"];
    const negative = ["bad", "slow", "expensive", "hate", "issue", "problem", "fail", "error"];

    positive.forEach(w => { if (text.includes(w)) score += 5; });
    negative.forEach(w => { if (text.includes(w)) score -= 5; });

    return Math.min(Math.max(score, 0), 100);
};
