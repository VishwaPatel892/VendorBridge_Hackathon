"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidation = exports.forgotPasswordValidation = exports.signupValidation = exports.loginValidation = void 0;
const express_validator_1 = require("express-validator");
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('role')
        .isIn(['Admin', 'Procurement Officer', 'Manager', 'Vendor'])
        .withMessage('Valid role is required'),
];
exports.signupValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('role')
        .isIn(['Admin', 'Procurement Officer', 'Manager', 'Vendor'])
        .withMessage('Valid role is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
];
exports.forgotPasswordValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
];
exports.resetPasswordValidation = [
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
];
//# sourceMappingURL=auth.validation.js.map