import mongoose, { Document } from 'mongoose';
interface IInvoiceLineItem {
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
}
export interface IInvoice extends Document {
    invoiceNumber: string;
    poId: mongoose.Types.ObjectId;
    vendorId: mongoose.Types.ObjectId;
    lineItems: IInvoiceLineItem[];
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
    dueDate: Date;
    status: 'generated' | 'sent' | 'paid' | 'overdue';
    pdfUrl?: string;
    emailSentAt?: Date;
    emailSentTo?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<IInvoice, {}, {}, {}, mongoose.Document<unknown, {}, IInvoice, {}, {}> & IInvoice & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=invoice.model.d.ts.map