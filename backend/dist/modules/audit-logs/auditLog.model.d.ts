import mongoose, { Document } from 'mongoose';
export interface IAuditLog extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
    entityType: string;
    entityId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}
declare const _default: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, {}> & IAuditLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=auditLog.model.d.ts.map