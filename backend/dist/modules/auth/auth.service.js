"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../users/user.model"));
const vendor_model_1 = __importDefault(require("../vendors/vendor.model"));
const errorHandler_1 = require("../../middleware/errorHandler");
const generateAccessToken = (payload) => {
    const expiresIn = (process.env.JWT_ACCESS_EXPIRES || '15m');
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn,
    });
};
const generateRefreshToken = (payload) => {
    const expiresIn = (process.env.JWT_REFRESH_EXPIRES || '7d');
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn,
    });
};
const register = async (params) => {
    const existingUser = await user_model_1.default.findOne({ email: params.email });
    if (existingUser) {
        throw new errorHandler_1.AppError('Email already registered', 409);
    }
    const user = await user_model_1.default.create({
        name: params.name || params.contactName || params.companyName,
        email: params.email,
        password: params.password,
        role: params.role,
    });
    if (params.role === 'Vendor') {
        const vendor = await vendor_model_1.default.create({
            companyName: params.companyName || params.contactName || params.email,
            contactPerson: params.contactName || params.name || '',
            email: params.email,
            phone: params.phone || '',
            gstNumber: params.gstNo,
            category: 'Other',
            address: params.address || { street: '', city: '', state: '', pincode: '' },
            status: 'pending',
            createdBy: user._id,
        });
        user.vendorId = vendor._id;
        await user.save();
    }
    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return {
        user: {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            token: accessToken,
            vendorId: user.vendorId?.toString(),
        },
        accessToken,
        refreshToken,
    };
};
const login = async (email, role) => {
    const user = await user_model_1.default.findOne({ email, role, isActive: true }).select('+password');
    if (!user) {
        throw new errorHandler_1.UnauthorizedError('Invalid credentials');
    }
    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return {
        user: {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            token: accessToken,
            vendorId: user.vendorId?.toString(),
        },
        accessToken,
        refreshToken,
    };
};
const refreshToken = async (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await user_model_1.default.findById(decoded.userId);
        if (!user || !user.isActive) {
            throw new errorHandler_1.UnauthorizedError('User not found or inactive');
        }
        const accessToken = generateAccessToken({
            userId: user._id.toString(),
            role: user.role,
        });
        return { accessToken };
    }
    catch (error) {
        throw new errorHandler_1.UnauthorizedError('Invalid refresh token');
    }
};
const forgotPassword = async (email) => {
    const user = await user_model_1.default.findOne({ email });
    if (!user)
        return;
    const resetToken = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '1h',
    });
    console.log(`Password reset link: ${process.env.FRONTEND_URL}/reset-password/${resetToken}`);
};
const resetPassword = async (token, newPassword) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await user_model_1.default.findById(decoded.userId).select('+password');
        if (!user)
            throw new errorHandler_1.UnauthorizedError('Invalid token');
        user.password = newPassword;
        await user.save();
    }
    catch (error) {
        throw new errorHandler_1.UnauthorizedError('Invalid or expired reset token');
    }
};
exports.default = { register, login, refreshToken, forgotPassword, resetPassword };
//# sourceMappingURL=auth.service.js.map