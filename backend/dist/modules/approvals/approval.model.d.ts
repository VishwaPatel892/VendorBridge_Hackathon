import mongoose, { Document } from 'mongoose';
interface ITimelineEntry {
    step: string;
    status: string;
    timestamp: Date;
    performedBy: mongoose.Types.ObjectId;
}
export interface IApproval extends Document {
    rfqId: mongoose.Types.ObjectId;
    quotationId: mongoose.Types.ObjectId;
    vendorId: mongoose.Types.ObjectId;
    requestedBy: mongoose.Types.ObjectId;
    assignedTo: mongoose.Types.ObjectId;
    status: 'pending' | 'approved' | 'rejected';
    remarks?: string;
    timeline: ITimelineEntry[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IApproval, {}, {}, {}, mongoose.Document<unknown, {}, IApproval, {}, {}> & IApproval & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=approval.model.d.ts.map