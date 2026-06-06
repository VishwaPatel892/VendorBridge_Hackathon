import { Request, Response, NextFunction } from 'express';
interface AuditLogConfig {
    entityType: string;
    action: string;
    getEntityId?: (req: Request, res: Response) => string | undefined;
}
declare const logAction: (config: AuditLogConfig) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default logAction;
//# sourceMappingURL=auditLog.middleware.d.ts.map