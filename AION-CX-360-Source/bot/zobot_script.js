// AION-CX 360° - Real SalesIQ Zobot Script
// Platform: Zoho SalesIQ (JavaScript Code)

// 1. Configuration
const BACKEND_URL = "http://localhost:3000/events/salesiq"; // REPLACE WITH NGROK URL FOR LIVE
const API_TOKEN = "YOUR_SECRET_TOKEN"; // Optional security

// 2. Main Handler (SalesIQ calls this)
exports.handler = async (context, callback) => {
    let response = {};
    const message = context.message;
    const session = context.session || {};

    // Initialize Session Data
    if (!session.step) session.step = "welcome";
    if (!session.data) session.data = {};
    if (!session.persona) session.persona = "General Assistant";
    if (!session.language) session.language = "en"; // Default to English

    // --- Language & Persona Logic ---
    const msgLower = message.toLowerCase();

    // Language Detection (Simple Override)
    if (msgLower.includes("tamil") || msgLower.includes("தமிழ்")) {
        session.language = "ta";
    } else if (msgLower.includes("english")) {
        session.language = "en";
    }

    // Persona Detection
    if (msgLower.includes("price") || msgLower.includes("cost") || msgLower.includes("budget") || msgLower.includes("விலை")) {
        session.persona = "Pricing Navigator";
    } else if (msgLower.includes("tech") || msgLower.includes("api") || msgLower.includes("integration") || msgLower.includes("தொழில்நுட்பம்")) {
        session.persona = "Technical Architect";
    } else if (msgLower.includes("enterprise") || msgLower.includes("scale") || msgLower.includes("security") || msgLower.includes("நிறுவனம்")) {
        session.persona = "Enterprise Consultant";
    } else if (msgLower.includes("reset") || msgLower.includes("start over") || msgLower.includes("மீண்டும்")) {
        session.step = "welcome";
        session.data = {};
        session.persona = "General Assistant";
        session.language = "en";
    }

    // --- Translations ---
    const T = {
        en: {
            welcome: `Hi! I'm AION, your ${session.persona}. \n\nI can help you with Pricing, Technical details, or Enterprise solutions. \n\nTo get started, may I have your **Name**?`,
            ask_email: (name) => `Nice to meet you, ${name}. \n\nWhat is your **Email Address** so I can send you the relevant info?`,
            ask_company: "Thanks! What is your **Company Name**?",
            ask_details: (persona) => `Got it. To tailor my response as a ${persona}, could you tell me a bit about your **Industry** and **Budget**?`,
            analyzing: (persona) => `Analyzing your profile with AION Intelligence (${persona} Mode)...`,
            complete: (score, status, summary) => `✅ **Analysis Complete**\n\n• **Score**: ${score}/100\n• **Status**: ${status}\n• **Insight**: ${summary}...\n\nI've notified an expert to assist you further!`,
            logged: "I've logged your details. An agent will be with you shortly.",
            error: "I'm having trouble connecting to the brain right now, but I've saved your info locally. An agent will contact you.",
            reset: (persona) => `Is there anything else I can help you with regarding ${persona}? (Type 'reset' to start over)`
        },
        ta: {
            welcome: `வணக்கம்! நான் AION, உங்கள் ${session.persona}. \n\nவிலை, தொழில்நுட்ப விவரங்கள் அல்லது நிறுவன தீர்வுகள் பற்றி நான் உங்களுக்கு உதவ முடியும். \n\nதொடங்குவதற்கு, உங்கள் **பெயர்** என்ன?`,
            ask_email: (name) => `சந்தித்ததில் மகிழ்ச்சி, ${name}. \n\nதொடர்புடைய தகவலை அனுப்ப உங்கள் **மின்னஞ்சல் முகவரி** என்ன?`,
            ask_company: "நன்றி! உங்கள் **நிறுவனத்தின் பெயர்** என்ன?",
            ask_details: (persona) => `புரிந்தது. ${persona} ஆக பதிலளிக்க, உங்கள் **தொழில்** மற்றும் **பட்ஜெட்** பற்றி சொல்ல முடியுமா?`,
            analyzing: (persona) => `AION நுண்ணறிவு மூலம் உங்கள் சுயவிவரத்தை ஆய்வு செய்கிறது (${persona} முறை)...`,
            complete: (score, status, summary) => `✅ **ஆய்வு முடிந்தது**\n\n• **மதிப்பெண்**: ${score}/100\n• **நிலை**: ${status}\n• **கண்ணோட்டம்**: ${summary}...\n\nஉங்களுக்கு உதவ ஒரு நிபுணரை அறிவித்துள்ளேன்!`,
            logged: "உங்கள் விவரங்களைப் பதிவு செய்துள்ளேன். விரைவில் ஒரு முகவர் உங்களைத் தொடர்புகொள்வார்.",
            error: "தற்போது மூளையுடன் இணைப்பதில் சிக்கல் உள்ளது, ஆனால் உங்கள் தகவலைச் சேமித்துள்ளேன்.",
            reset: (persona) => `${persona} தொடர்பாக வேறு ஏதேனும் உதவி தேவையா? (மீண்டும் தொடங்க 'reset' என தட்டச்சு செய்யவும்)`
        }
    };

    const txt = T[session.language];

    // --- Conversation Flow ---
    try {
        // Welcome / Start
        if (session.step === "welcome") {
            response.text = txt.welcome;
            // Add Quick Replies for Language if just starting
            if (!session.data.lang_selected) {
                response.suggestions = ["English", "தமிழ் (Tamil)"];
                session.data.lang_selected = true;
            }
            session.step = "ask_email";
        }
        // Name -> Email
        else if (session.step === "ask_email") {
            session.data.name = message;
            response.text = txt.ask_email(message);
            session.step = "ask_company";
        }
        // Email -> Company
        else if (session.step === "ask_company") {
            session.data.email = message;
            response.text = txt.ask_company;
            session.step = "ask_details";
        }
        // Company -> Details
        else if (session.step === "ask_details") {
            session.data.company = message;
            response.text = txt.ask_details(session.persona);
            session.step = "process_data";
        }
        // Process & Send to Backend
        else if (session.step === "process_data") {
            session.data.industry_budget_context = message;
            session.data.visitor_id = context.visitor_id || "v_" + Date.now();
            session.data.chat_transcript = `Visitor: ${message} (Persona: ${session.persona})`;
            session.data.use_case = `User interacting with ${session.persona}. Context: ${message}`;
            session.data.bot_mode = session.persona;
            session.data.page_path = context.current_page || "/home"; // Capture Page Path

            response.text = txt.analyzing(session.persona);

            // --- Send to Backend ---
            try {
                const backendRes = await fetch(BACKEND_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(session.data)
                });

                const result = await backendRes.json();

                if (result.success) {
                    const lead = result.lead;
                    response.text = txt.complete(lead.lead_score, lead.status, lead.ai_summary.substring(0, 100));
                    response.action = "forward"; // Escalate to human operator
                } else {
                    response.text = txt.logged;
                    response.action = "forward";
                }
            } catch (apiError) {
                console.error("Backend API Error:", apiError);
                response.text = txt.error;
                response.action = "forward";
            }

            session.step = "complete";
        }
        // Complete
        else {
            response.text = txt.reset(session.persona);
        }

    } catch (error) {
        console.error("Bot Logic Error:", error);
        response.text = "I encountered a glitch. Connecting you to a human agent...";
        response.action = "forward";
    }

    // Return response to SalesIQ
    callback(null, {
        text: response.text,
        context: session,
        action: response.action,
        suggestions: response.suggestions || []
    });
};
