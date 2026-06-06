import { Request, Response, NextFunction } from 'express';
export interface JwtPayload {
    userId: string;
    role: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: string;
                _id: string;
            };
        }
    }
}
declare const verifyToken: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export default verifyToken;
//# sourceMappingURL=auth.middleware.d.ts.map