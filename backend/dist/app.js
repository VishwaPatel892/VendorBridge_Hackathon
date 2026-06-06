"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = __importDefault(require("./config/db"));
const cloudinary_1 = __importDefault(require("./config/cloudinary"));
const nodemailer_1 = require("./config/nodemailer");
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const vendor_routes_1 = __importDefault(require("./modules/vendors/vendor.routes"));
const rfq_routes_1 = __importDefault(require("./modules/rfq/rfq.routes"));
const quotation_routes_1 = __importDefault(require("./modules/quotations/quotation.routes"));
const approval_routes_1 = __importDefault(require("./modules/approvals/approval.routes"));
const po_routes_1 = __importDefault(require("./modules/purchase-orders/po.routes"));
const invoice_routes_1 = __importDefault(require("./modules/invoices/invoice.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const notification_routes_1 = __importDefault(require("./modules/notifications/notification.routes"));
const auditLog_routes_1 = __importDefault(require("./modules/audit-logs/auditLog.routes"));
const app = (0, express_1.default)();
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later' },
});
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many auth attempts, please try again later' },
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_mongo_sanitize_1.default)());
app.use(globalLimiter);
app.use('/api/auth', authLimiter, auth_routes_1.default);
app.use('/api/vendors', vendor_routes_1.default);
app.use('/api/rfqs', rfq_routes_1.default);
app.use('/api/quotations', quotation_routes_1.default);
app.use('/api/approvals', approval_routes_1.default);
app.use('/api/pos', po_routes_1.default);
app.use('/api/invoices', invoice_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/audit-logs', auditLog_routes_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'VendorBridge API is running', timestamp: new Date().toISOString() });
});

app.post('/api/chat', async (req, res, next) => {
    try {
        const { message, context } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.json({ success: true, data: { reply: "Sorry, the Groq API key is not configured in the backend/.env file." } });
        }

        const systemPrompt = `You are the VendorBridge AI Procurement Assistant. 
You are an expert, professional, and helpful assistant.
Use the following real-time procurement data to answer the user's questions:

${context || ''}

Answer concisely. If the user asks something not covered by the data, rely on your general knowledge but clarify you can't see that specific data in the system. Use markdown for formatting (e.g. bolding numbers or key terms).`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
        res.json({ success: true, data: { reply } });
    } catch (error) {
        console.error('Chatbot Error:', error);
        res.json({ success: true, data: { reply: "I encountered an error connecting to the AI provider. Please check your API keys and try again." } });
    }
});

app.use(errorHandler_1.default);
const initializeApp = async () => {
    await (0, db_1.default)();
    (0, cloudinary_1.default)();
    try {
        await (0, nodemailer_1.configureNodemailer)();
    }
    catch {
        console.warn('Nodemailer not configured, email features disabled');
    }
};
exports.initializeApp = initializeApp;
exports.default = app;
//# sourceMappingURL=app.js.map