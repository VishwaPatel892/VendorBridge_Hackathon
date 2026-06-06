import mongoose, { Document } from 'mongoose';
export interface IVendor extends Document {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    gstNumber?: string;
    category: 'IT' | 'Manufacturing' | 'Services' | 'Logistics' | 'Other';
    address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    bankDetails?: {
        accountNumber: string;
        ifsc: string;
        bankName: string;
    };
    status: 'active' | 'inactive' | 'pending';
    rating: number;
    userId?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IVendor, {}, {}, {}, mongoose.Document<unknown, {}, IVendor, {}, {}> & IVendor & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=vendor.model.d.ts.map