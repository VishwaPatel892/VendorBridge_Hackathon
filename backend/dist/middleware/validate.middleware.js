"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("./errorHandler");
const validate = (validations) => {
    return async (req, _res, next) => {
        for (const validation of validations) {
            await validation.run(req);
        }
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map((err) => ({
                field: err.path || err.param,
                message: err.msg,
            }));
            next(new errorHandler_1.ValidationError('Validation failed', formattedErrors));
            return;
        }
        next();
    };
};
exports.default = validate;
//# sourceMappingURL=validate.middleware.js.map