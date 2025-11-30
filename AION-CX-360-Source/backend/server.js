const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import Helpers
const leadScoring = require("./helpers/leadScoring");
const gemini = require("./helpers/gemini");
const dbHelper = require("./helpers/dbHelper");
const crm = require("./helpers/crm");

const app = express();
app.use(express.json());
app.use(cors());

// Import Routes
const insightsRoutes = require("./routes/insights");
const dashboardRoutes = require("./routes/dashboard");
const pipelineRoutes = require("./routes/pipeline");
const aiRoutes = require("./routes/ai");
const crmRoutes = require("./routes/crm");
const salesiqRoutes = require("./routes/salesiq");

// Use Routes
app.use("/insights", insightsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/pipeline", pipelineRoutes);
app.use("/ai", aiRoutes);
app.use("/crm", crmRoutes);
app.use("/events", salesiqRoutes); // Mounts at /events/salesiq

// Alias for /leads/live -> /pipeline/data (or similar)
app.get("/leads/live", (req, res) => {
    res.redirect("/pipeline/data");
});

// OAuth Callback Route
app.get("/oauth/callback", (req, res) => {
    const code = req.query.code;
    res.send(`
        <h1>OAuth Code Received</h1>
        <p>Code: <code>${code}</code></p>
        <p>Please copy this code and paste it back into the chat.</p>
    `);
    console.log("OAuth Code Received:", code);
});

app.get("/", (req, res) => {
    res.send("AION Backend Running - InfoTechVMD");
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`AION Backend Running on http://localhost:${PORT}`);
});
