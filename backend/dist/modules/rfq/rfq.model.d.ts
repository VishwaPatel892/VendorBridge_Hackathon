import mongoose, { Document } from 'mongoose';
interface ILineItem {
    productName: string;
    description?: string;
    quantity: number;
    unit: string;
    estimatedUnitPrice: number;
}
interface IAssignedVendor {
    vendorId: mongoose.Types.ObjectId;
    invitedAt: Date;
    status: 'invited' | 'responded' | 'declined';
}
export interface IRFQ extends Document {
    rfqNumber: string;
    title: string;
    description: string;
    category: string;
    lineItems: ILineItem[];
    attachments: {
        filename: string;
        url: string;
        cloudinaryId?: string;
    }[];
    deadline: Date;
    status: 'draft' | 'open' | 'closed' | 'awarded' | 'cancelled';
    assignedVendors: IAssignedVendor[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IRFQ, {}, {}, {}, mongoose.Document<unknown, {}, IRFQ, {}, {}> & IRFQ & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=rfq.model.d.ts.map