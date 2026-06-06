"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err instanceof ValidationError && err.errors.length && { errors: err.errors }),
        });
        return;
    }
    if (err.name === 'CastError') {
        res.status(400).json({
            success: false,
            message: 'Invalid ID format',
        });
        return;
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        res.status(409).json({
            success: false,
            message: `Duplicate value for ${field}`,
        });
        return;
    }
    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            message: err.message,
        });
        return;
    }
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
};
exports.default = errorHandler;
//# sourceMappingURL=errorHandler.js.map