import { Request, Response, NextFunction } from 'express';
declare const allowRoles: (...roles: string[]) => (req: Request, _res: Response, next: NextFunction) => void;
export default allowRoles;
//# sourceMappingURL=role.middleware.d.ts.map