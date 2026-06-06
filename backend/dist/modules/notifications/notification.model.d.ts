import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'rfq_invite' | 'quotation_received' | 'approval_pending' | 'approved' | 'rejected' | 'po_generated' | 'invoice_sent';
    title: string;
    message: string;
    entityId?: string;
    entityType?: string;
    isRead: boolean;
    createdAt: Date;
}
declare const _default: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=notification.model.d.ts.map