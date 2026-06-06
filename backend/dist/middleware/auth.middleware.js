"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const user_model_1 = __importDefault(require("../modules/users/user.model"));
const verifyToken = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await user_model_1.default.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            throw new errorHandler_1.UnauthorizedError('User not found or inactive');
        }
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            _id: decoded.userId,
        };
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.UnauthorizedError) {
            next(error);
        }
        else {
            next(new errorHandler_1.UnauthorizedError('Invalid or expired token'));
        }
    }
};
exports.default = verifyToken;
//# sourceMappingURL=auth.middleware.js.map