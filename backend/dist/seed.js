"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("./modules/users/user.model"));
const vendor_model_1 = __importDefault(require("./modules/vendors/vendor.model"));
const rfq_model_1 = __importDefault(require("./modules/rfq/rfq.model"));
const quotation_model_1 = __importDefault(require("./modules/quotations/quotation.model"));
const approval_model_1 = __importDefault(require("./modules/approvals/approval.model"));
const po_model_1 = __importDefault(require("./modules/purchase-orders/po.model"));
const invoice_model_1 = __importDefault(require("./modules/invoices/invoice.model"));
const notification_model_1 = __importDefault(require("./modules/notifications/notification.model"));
const auditLog_model_1 = __importDefault(require("./modules/audit-logs/auditLog.model"));
const seed = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        await Promise.all([
            user_model_1.default.deleteMany({}),
            vendor_model_1.default.deleteMany({}),
            rfq_model_1.default.deleteMany({}),
            quotation_model_1.default.deleteMany({}),
            approval_model_1.default.deleteMany({}),
            po_model_1.default.deleteMany({}),
            invoice_model_1.default.deleteMany({}),
            notification_model_1.default.deleteMany({}),
            auditLog_model_1.default.deleteMany({}),
        ]);
        console.log('Cleared existing data');
        const hashedPassword = await bcryptjs_1.default.hash('Admin@123', 12);
        const [admin, manager, po1, po2, vendorUser1, vendorUser2, vendorUser3, vendorUser4, vendorUser5] = await user_model_1.default.create([
            { name: 'Admin User', email: 'admin@vendorbridge.com', password: hashedPassword, role: 'Admin' },
            { name: 'Manager User', email: 'manager@vendorbridge.com', password: hashedPassword, role: 'Manager' },
            { name: 'Procurement Officer 1', email: 'po1@vendorbridge.com', password: hashedPassword, role: 'Procurement Officer' },
            { name: 'Procurement Officer 2', email: 'po2@vendorbridge.com', password: hashedPassword, role: 'Procurement Officer' },
            { name: 'ACME Corp Vendor', email: 'vendor1@vendorbridge.com', password: hashedPassword, role: 'Vendor' },
            { name: 'Global Logistics Vendor', email: 'vendor2@vendorbridge.com', password: hashedPassword, role: 'Vendor' },
            { name: 'TechSolutions Vendor', email: 'vendor3@vendorbridge.com', password: hashedPassword, role: 'Vendor' },
            { name: 'BuildRight Materials', email: 'vendor4@vendorbridge.com', password: hashedPassword, role: 'Vendor' },
            { name: 'DataSync Systems', email: 'vendor5@vendorbridge.com', password: hashedPassword, role: 'Vendor' },
        ]);
        console.log('Created users');
        const vendors = await vendor_model_1.default.create([
            {
                companyName: 'ACME Corp Industrial',
                contactPerson: 'John Smith',
                email: 'contact@acmecorp.com',
                phone: '+1-555-0101',
                gstNumber: 'GSTIN-ACME-001',
                category: 'Manufacturing',
                address: { street: '123 Industrial Blvd', city: 'Detroit', state: 'Michigan', pincode: '48201' },
                bankDetails: { accountNumber: 'ACC001', ifsc: 'BANK001', bankName: 'First National Bank' },
                status: 'active',
                rating: 4.8,
                userId: vendorUser1._id,
                createdBy: admin._id,
            },
            {
                companyName: 'Global Logistics Co',
                contactPerson: 'Sarah Johnson',
                email: 'info@globallogistics.com',
                phone: '+1-555-0102',
                gstNumber: 'GSTIN-GLB-002',
                category: 'Logistics',
                address: { street: '456 Shipping Lane', city: 'Miami', state: 'Florida', pincode: '33101' },
                bankDetails: { accountNumber: 'ACC002', ifsc: 'BANK002', bankName: 'Global Trust Bank' },
                status: 'active',
                rating: 4.2,
                userId: vendorUser2._id,
                createdBy: admin._id,
            },
            {
                companyName: 'TechSolutions Inc',
                contactPerson: 'Mike Chen',
                email: 'sales@techsolutions.com',
                phone: '+1-555-0103',
                gstNumber: 'GSTIN-TEC-003',
                category: 'IT',
                address: { street: '789 Tech Park', city: 'San Jose', state: 'California', pincode: '95101' },
                bankDetails: { accountNumber: 'ACC003', ifsc: 'BANK003', bankName: 'Silicon Valley Bank' },
                status: 'pending',
                rating: 4.0,
                userId: vendorUser3._id,
                createdBy: admin._id,
            },
            {
                companyName: 'BuildRight Materials',
                contactPerson: 'Emily Davis',
                email: 'orders@buildright.com',
                phone: '+1-555-0104',
                gstNumber: 'GSTIN-BLD-004',
                category: 'Manufacturing',
                address: { street: '321 Construction Ave', city: 'Houston', state: 'Texas', pincode: '77001' },
                bankDetails: { accountNumber: 'ACC004', ifsc: 'BANK004', bankName: 'Texas Commerce Bank' },
                status: 'active',
                rating: 4.5,
                userId: vendorUser4._id,
                createdBy: po1._id,
            },
            {
                companyName: 'DataSync Systems',
                contactPerson: 'Alex Rivera',
                email: 'info@datasync.com',
                phone: '+1-555-0105',
                gstNumber: 'GSTIN-DAT-005',
                category: 'IT',
                address: { street: '654 Digital Drive', city: 'Austin', state: 'Texas', pincode: '73301' },
                bankDetails: { accountNumber: 'ACC005', ifsc: 'BANK005', bankName: 'Austin National Bank' },
                status: 'active',
                rating: 4.3,
                userId: vendorUser5._id,
                createdBy: po1._id,
            },
        ]);
        console.log('Created vendors');
        await user_model_1.default.findByIdAndUpdate(vendorUser1._id, { vendorId: vendors[0]._id });
        await user_model_1.default.findByIdAndUpdate(vendorUser2._id, { vendorId: vendors[1]._id });
        await user_model_1.default.findByIdAndUpdate(vendorUser3._id, { vendorId: vendors[2]._id });
        await user_model_1.default.findByIdAndUpdate(vendorUser4._id, { vendorId: vendors[3]._id });
        await user_model_1.default.findByIdAndUpdate(vendorUser5._id, { vendorId: vendors[4]._id });
        const rfqs = await rfq_model_1.default.create([
            {
                rfqNumber: 'RFQ-2026-001',
                title: 'Server Rack Equipment',
                description: 'Need 20 server racks for data center expansion',
                category: 'IT',
                lineItems: [
                    { productName: '42U Server Rack', description: 'Standard 42U rack cabinet', quantity: 20, unit: 'units', estimatedUnitPrice: 1200 },
                    { productName: 'PDU Unit', description: 'Power distribution unit', quantity: 20, unit: 'units', estimatedUnitPrice: 350 },
                    { productName: 'Cable Management Kit', description: 'Horizontal cable management', quantity: 40, unit: 'units', estimatedUnitPrice: 75 },
                ],
                deadline: new Date('2026-07-15'),
                status: 'open',
                assignedVendors: [
                    { vendorId: vendors[0]._id, invitedAt: new Date(), status: 'invited' },
                    { vendorId: vendors[1]._id, invitedAt: new Date(), status: 'invited' },
                    { vendorId: vendors[2]._id, invitedAt: new Date(), status: 'invited' },
                ],
                createdBy: po1._id,
            },
            {
                rfqNumber: 'RFQ-2026-002',
                title: 'Office Furniture Supply',
                description: 'Furniture for new office floor - 50 workstations',
                category: 'Manufacturing',
                lineItems: [
                    { productName: 'Ergonomic Chair', description: 'Adjustable ergonomic office chair', quantity: 50, unit: 'units', estimatedUnitPrice: 450 },
                    { productName: 'Standing Desk', description: 'Electric height-adjustable desk', quantity: 50, unit: 'units', estimatedUnitPrice: 800 },
                ],
                deadline: new Date('2026-06-30'),
                status: 'closed',
                assignedVendors: [
                    { vendorId: vendors[0]._id, invitedAt: new Date(), status: 'responded' },
                    { vendorId: vendors[3]._id, invitedAt: new Date(), status: 'responded' },
                ],
                createdBy: po1._id,
            },
            {
                rfqNumber: 'RFQ-2026-003',
                title: 'Network Security Audit',
                description: 'Third-party security audit for all internal systems',
                category: 'Services',
                lineItems: [
                    { productName: 'Infrastructure Audit', description: 'Full network infrastructure security audit', quantity: 1, unit: 'service', estimatedUnitPrice: 25000 },
                    { productName: 'Penetration Testing', description: 'External and internal penetration testing', quantity: 1, unit: 'service', estimatedUnitPrice: 15000 },
                ],
                deadline: new Date('2026-08-01'),
                status: 'draft',
                assignedVendors: [],
                createdBy: po2._id,
            },
        ]);
        console.log('Created RFQs');
        const quotations = await quotation_model_1.default.create([
            {
                rfqId: rfqs[1]._id,
                vendorId: vendors[0]._id,
                lineItems: [
                    { rfqLineItemId: rfqs[1].lineItems[0]._id?.toString() || '1', unitPrice: 425, totalPrice: 21250 },
                    { rfqLineItemId: rfqs[1].lineItems[1]._id?.toString() || '2', unitPrice: 750, totalPrice: 37500 },
                ],
                deliveryTimeline: 21,
                notes: 'Can offer bulk discount on order above $50,000',
                attachments: [],
                subtotal: 58750,
                taxAmount: 10575,
                grandTotal: 69325,
                status: 'accepted',
                submittedAt: new Date('2026-06-01'),
            },
            {
                rfqId: rfqs[1]._id,
                vendorId: vendors[3]._id,
                lineItems: [
                    { rfqLineItemId: rfqs[1].lineItems[0]._id?.toString() || '1', unitPrice: 440, totalPrice: 22000 },
                    { rfqLineItemId: rfqs[1].lineItems[1]._id?.toString() || '2', unitPrice: 780, totalPrice: 39000 },
                ],
                deliveryTimeline: 28,
                notes: 'Standard delivery terms apply',
                attachments: [],
                subtotal: 61000,
                taxAmount: 10980,
                grandTotal: 71980,
                status: 'under_review',
                submittedAt: new Date('2026-06-02'),
            },
        ]);
        console.log('Created quotations');
        const approval = await approval_model_1.default.create({
            rfqId: rfqs[1]._id,
            quotationId: quotations[0]._id,
            vendorId: vendors[0]._id,
            requestedBy: po1._id,
            assignedTo: manager._id,
            status: 'approved',
            timeline: [
                { step: 'initiated', status: 'pending', timestamp: new Date('2026-06-03'), performedBy: po1._id },
                { step: 'approved', status: 'approved', timestamp: new Date('2026-06-04'), performedBy: manager._id },
            ],
        });
        console.log('Created approval');
        const po = await po_model_1.default.create({
            poNumber: 'PO-2026-001',
            rfqId: rfqs[1]._id,
            quotationId: quotations[0]._id,
            vendorId: vendors[0]._id,
            approvalId: approval._id,
            lineItems: [
                { productName: 'Ergonomic Chair', quantity: 50, unit: 'units', unitPrice: 425, totalPrice: 21250 },
                { productName: 'Standing Desk', quantity: 50, unit: 'units', unitPrice: 750, totalPrice: 37500 },
            ],
            subtotal: 58750,
            taxAmount: 10575,
            grandTotal: 69325,
            terms: 'Net 30 days. Delivery within 21 days.',
            deliveryDate: new Date('2026-07-15'),
            status: 'generated',
            createdBy: po1._id,
        });
        console.log('Created purchase order');
        await invoice_model_1.default.create({
            invoiceNumber: 'INV-2026-001',
            poId: po._id,
            vendorId: vendors[0]._id,
            lineItems: po.lineItems,
            subtotal: po.subtotal,
            taxAmount: po.taxAmount,
            grandTotal: po.grandTotal,
            dueDate: new Date('2026-08-01'),
            status: 'generated',
            createdBy: po1._id,
        });
        console.log('Created invoice');
        await notification_model_1.default.create([
            { userId: manager._id, type: 'approval_pending', title: 'Approval Needed', message: 'Office Furniture RFQ requires your approval.', entityId: approval._id.toString(), entityType: 'Approval' },
            { userId: po1._id, type: 'approved', title: 'Approval Approved', message: 'Office Furniture RFQ has been approved.', entityId: approval._id.toString(), entityType: 'Approval' },
            { userId: vendors[0].userId.toString(), type: 'po_generated', title: 'PO Generated', message: 'PO PO-2026-001 has been generated for Office Furniture Supply.', entityId: po._id.toString(), entityType: 'PurchaseOrder' },
        ]);
        console.log('Created notifications');
        await auditLog_model_1.default.create([
            { userId: admin._id, action: 'seed', entityType: 'System', entityId: 'seed', changes: { message: 'Database seeded' }, ipAddress: '127.0.0.1', userAgent: 'seed-script' },
        ]);
        console.log('Created audit logs');
        console.log('\n======= SEED COMPLETE =======');
        console.log('Admin (admin@vendorbridge.com / Admin@123)');
        console.log('Manager (manager@vendorbridge.com / Manager@123)');
        console.log('PO1 (po1@vendorbridge.com / Admin@123)');
        console.log('PO2 (po2@vendorbridge.com / Admin@123)');
        console.log('Vendor1 (vendor1@vendorbridge.com / Admin@123)');
        console.log('Vendor2 (vendor2@vendorbridge.com / Admin@123)');
        console.log('Vendor3 (vendor3@vendorbridge.com / Admin@123)');
        console.log('Vendor4 (vendor4@vendorbridge.com / Admin@123)');
        console.log('==============================');
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};
seed();
//# sourceMappingURL=seed.js.map