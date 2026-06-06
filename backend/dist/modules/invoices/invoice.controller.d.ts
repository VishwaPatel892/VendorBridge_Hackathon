import { Request, Response, NextFunction } from 'express';
export declare const generate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPDF: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const sendEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const pay: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=invoice.controller.d.ts.map