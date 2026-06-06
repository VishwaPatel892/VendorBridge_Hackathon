import { Request, Response, NextFunction } from 'express';
declare const validate: (validations: any[]) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export default validate;
//# sourceMappingURL=validate.middleware.d.ts.map