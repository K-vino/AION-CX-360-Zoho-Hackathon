const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const LOG_FILE = 'validation_debug.log';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

async function runValidation() {
    fs.writeFileSync(LOG_FILE, "--- Validation Start ---\n");
    log("🚀 Starting AION-CX 360° System Validation...");

    let successCount = 0;
    let failCount = 0;

    async function testEndpoint(name, fn) {
        try {
            log(`Testing ${name}... `);
            await fn();
            log("✅ PASS");
            successCount++;
        } catch (error) {
            log("❌ FAIL");
            log(`   Error: ${error.message}`);
            if (error.response) {
                log(`   Status: ${error.response.status}`);
                log(`   Data: ${JSON.stringify(error.response.data)}`);
            }
            failCount++;
        }
    }

    // 1. Test Dashboard Overview
    await testEndpoint('/dashboard/overview', async () => {
        const res = await axios.get(`${BASE_URL}/dashboard/overview`);
        if (res.data.total_leads === undefined) throw new Error("Missing total_leads in response");
    });

    // 2. Test Pipeline Data
    await testEndpoint('/pipeline/data', async () => {
        const res = await axios.get(`${BASE_URL}/pipeline/data`);
        if (!Array.isArray(res.data)) throw new Error("Response is not an array");
    });

    // 3. Test SalesIQ Event (Lead Creation)
    let testVisitorId = `v_test_${Date.now()}`;
    await testEndpoint('/events/salesiq', async () => {
        const payload = {
            visitor_id: testVisitorId,
            name: "Validation Bot",
            email: "bot@validation.com",
            company: "Test Corp",
            industry: "Technology",
            budget: "$10k+",
            chat_transcript: "I am interested in your enterprise plan.",
            pages_visited: ["Home", "Pricing"]
        };
        const res = await axios.post(`${BASE_URL}/events/salesiq`, payload);
        if (!res.data.success) throw new Error("Success flag is false");
        if (!res.data.lead) throw new Error("Missing lead object");
    });

    // 4. Test AI Email Generation
    await testEndpoint('/ai/email', async () => {
        const payload = {
            visitor_id: testVisitorId,
            template_type: "intro"
        };
        const res = await axios.post(`${BASE_URL}/ai/email`, payload);
        if (!res.data.subject) throw new Error("Missing email subject");
        if (!res.data.body) throw new Error("Missing email body");
    });

    // 5. Test AI Suggestion (Rescore/Insight)
    await testEndpoint('/ai/rescore', async () => {
        const payload = {
            visitor_id: testVisitorId
        };
        const res = await axios.post(`${BASE_URL}/ai/rescore`, payload);
        if (!res.data.success) throw new Error("Rescore failed");
    });

    log("\n--- Validation Summary ---");
    log(`Total Tests: ${successCount + failCount}`);
    log(`Passed: ${successCount}`);
    log(`Failed: ${failCount}`);

    if (failCount === 0) {
        log("\n✨ SYSTEM IS FULLY OPERATIONAL ✨");
    } else {
        log("\n⚠️ SYSTEM HAS ISSUES. CHECK LOGS.");
        process.exit(1);
    }
}

runValidation();
