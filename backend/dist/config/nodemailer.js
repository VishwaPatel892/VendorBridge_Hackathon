"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureNodemailer = exports.getTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
let transporter;
const configureNodemailer = async () => {
    try {
        transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.GMAIL_USER,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            },
        });
        await transporter.verify();
        console.log('Nodemailer configured successfully');
    }
    catch (error) {
        console.warn('Nodemailer configuration failed (emails will not send):', error);
    }
};
exports.configureNodemailer = configureNodemailer;
const getTransporter = () => transporter;
exports.getTransporter = getTransporter;
//# sourceMappingURL=nodemailer.js.map