import mongoose, { Document } from 'mongoose';
export interface IQuotationLineItem {
    rfqLineItemId: string;
    unitPrice: number;
    totalPrice: number;
}
export interface IQuotation extends Document {
    rfqId: mongoose.Types.ObjectId;
    vendorId: mongoose.Types.ObjectId;
    lineItems: IQuotationLineItem[];
    deliveryTimeline: number;
    notes?: string;
    attachments: {
        filename: string;
        url: string;
    }[];
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
    status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
    submittedAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IQuotation, {}, {}, {}, mongoose.Document<unknown, {}, IQuotation, {}, {}> & IQuotation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=quotation.model.d.ts.map