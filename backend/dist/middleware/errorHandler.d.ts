import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export declare class NotFoundError extends AppError {
    constructor(resource?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class ValidationError extends AppError {
    errors: any[];
    constructor(message?: string, errors?: any[]);
}
declare const errorHandler: (err: Error, _req: Request, res: Response, _next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map