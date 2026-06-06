"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthCallback = exports.googleAuthRedirect = exports.resetPassword = exports.forgotPassword = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const auth_service_1 = __importDefault(require("./auth.service"));
const REFRESH_TOKEN_COOKIE = 'refreshToken';
const register = async (req, res, next) => {
    try {
        const result = await auth_service_1.default.register(req.body);
        res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({ success: true, data: result.user });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, role } = req.body;
        const result = await auth_service_1.default.login(email, role);
        res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ success: true, data: result.user });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const token = req.cookies[REFRESH_TOKEN_COOKIE];
        if (!token) {
            res.status(401).json({ success: false, message: 'No refresh token' });
            return;
        }
        const result = await auth_service_1.default.refreshToken(token);
        res.json({ success: true, data: { accessToken: result.accessToken } });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
const logout = async (_req, res) => {
    res.clearCookie(REFRESH_TOKEN_COOKIE);
    res.json({ success: true, message: 'Logged out' });
};
exports.logout = logout;
const forgotPassword = async (req, res, next) => {
    try {
        await auth_service_1.default.forgotPassword(req.body.email);
        res.json({ success: true, message: 'If email exists, reset link sent' });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        await auth_service_1.default.resetPassword(req.params.token, req.body.password);
        res.json({ success: true, message: 'Password reset successful' });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
const googleAuthRedirect = (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
    res.redirect(url);
};
exports.googleAuthRedirect = googleAuthRedirect;

const googleAuthCallback = async (req, res, next) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=NoCode`);
        }

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_CALLBACK_URL,
                grant_type: 'authorization_code'
            })
        });

        const tokenData = await tokenResponse.json();
        if (!tokenData.id_token) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=InvalidToken`);
        }

        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(tokenData.id_token);
        
        const User = require('../users/user.model').default;
        let user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?gsi_credential=${tokenData.id_token}`);
        }

        const payload = { userId: user._id.toString(), role: user.role };
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'artpark_secret_key_2024_secure_change_me', { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'artpark_secret_key_2024_secure_change_me', { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect(`${process.env.FRONTEND_URL}/login?gsi_credential=${tokenData.id_token}`);
    } catch (error) {
        console.error(error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=ServerError`);
    }
};
exports.googleAuthCallback = googleAuthCallback;
//# sourceMappingURL=auth.controller.js.map