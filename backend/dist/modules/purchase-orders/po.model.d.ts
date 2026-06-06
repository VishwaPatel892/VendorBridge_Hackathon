import mongoose, { Document } from 'mongoose';
interface IPOLineItem {
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
}
export interface IPO extends Document {
    poNumber: string;
    rfqId: mongoose.Types.ObjectId;
    quotationId: mongoose.Types.ObjectId;
    vendorId: mongoose.Types.ObjectId;
    approvalId: mongoose.Types.ObjectId;
    lineItems: IPOLineItem[];
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
    terms?: string;
    deliveryDate?: Date;
    status: 'generated' | 'sent' | 'delivered' | 'cancelled';
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<IPO, {}, {}, {}, mongoose.Document<unknown, {}, IPO, {}, {}> & IPO & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=po.model.d.ts.map