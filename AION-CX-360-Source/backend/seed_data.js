const fs = require('fs');
const path = require('path');

// Configuration
const COUNT = 1000;
const DB_PATH = path.join(__dirname, 'db.json');

// Data Pools
const FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const COMPANIES = ["TechCorp", "InnovateX", "CloudSystems", "DataFlow", "AlphaSolutions", "OmegaInc", "NextGen", "SoftWarez", "CyberDyne", "GlobalTech", "FutureNet", "SmartSys", "EcoEnergy", "FinTechPro", "HealthPlus", "EduLearn", "AutoDrive", "AeroSpace", "RetailGiant", "LogiTech"];
const INDUSTRIES = ["SaaS", "Finance", "Healthcare", "Retail", "Manufacturing", "Education", "Real Estate", "Logistics"];
const ACTIONS = ["Schedule Demo", "Send Pricing", "Nurture Campaign", "Contact in 30 Days", "Immediate Call", "Send Case Study", "Ignore"];

// Helper to get random item
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random score
const getScore = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate Leads
const leads = {};

// 1. Add Specific Test Visitor (For Widget Demo)
leads["test_visitor_1"] = {
    visitor_id: "test_visitor_1",
    name: "John Doe",
    email: "john.doe@techcorp.com",
    company: "TechCorp Inc.",
    industry: "SaaS",
    budget_range: "$100k+",
    timeline: "Immediate",
    use_case: "Enterprise CRM Automation",
    lead_score: 95,
    intent_score: 98,
    fit_score: 90,
    conversion_probability: 0.95,
    status: "Hot",
    ai_summary: "High-value enterprise prospect seeking immediate implementation. Budget confirmed.",
    ai_recommended_action: "Schedule Executive Demo",
    chat_transcript: "Visitor: I need enterprise CRM. Bot: Budget? Visitor: $100k+",
    updated_at: new Date().toISOString()
};

console.log(`Generating ${COUNT} leads...`);

for (let i = 0; i < COUNT; i++) {
    const firstName = getRandom(FIRST_NAMES);
    const lastName = getRandom(LAST_NAMES);
    const company = getRandom(COMPANIES) + " " + (Math.random() > 0.5 ? "Inc" : "Ltd");
    const industry = getRandom(INDUSTRIES);

    // Logic for consistency
    let leadScore = getScore(10, 99);
    let status = 'Cold';
    let action = 'Ignore';

    if (leadScore >= 75) {
        status = 'Hot';
        action = Math.random() > 0.3 ? 'Immediate Call' : 'Schedule Demo';
    } else if (leadScore >= 40) {
        status = 'Warm';
        action = Math.random() > 0.5 ? 'Send Pricing' : 'Nurture Campaign';
    } else {
        status = 'Cold';
        action = 'Send Case Study';
    }

    const visitorId = `visitor_${1000 + i}`;

    leads[visitorId] = {
        visitor_id: visitorId,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.split(' ')[0].toLowerCase()}.com`,
        company: company,
        industry: industry,
        budget_range: Math.random() > 0.7 ? "$10k+" : "$1k-5k",
        timeline: Math.random() > 0.6 ? "Immediate" : "3-6 Months",
        use_case: "Looking for enterprise automation solutions.",
        lead_score: leadScore,
        intent_score: getScore(leadScore - 10, leadScore + 5),
        fit_score: getScore(50, 90),
        conversion_probability: (leadScore / 100).toFixed(2),
        status: status,
        ai_summary: `AI Analysis: ${status} lead from ${industry}. High intent detected based on browsing pricing page.`,
        ai_recommended_action: action,
        chat_transcript: "Visitor: Hi, pricing? Bot: Sure...",
        updated_at: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
    };
}

// Write to DB
fs.writeFileSync(DB_PATH, JSON.stringify(leads, null, 2));
console.log(`✅ Successfully generated ${COUNT} leads in ${DB_PATH}`);
