"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("./errorHandler");
const allowRoles = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            next(new errorHandler_1.ForbiddenError('Authentication required'));
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(new errorHandler_1.ForbiddenError('Insufficient permissions'));
            return;
        }
        next();
    };
};
exports.default = allowRoles;
//# sourceMappingURL=role.middleware.js.map