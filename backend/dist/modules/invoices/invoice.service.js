"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const invoice_model_1 = __importDefault(require("./invoice.model"));
const po_model_1 = __importDefault(require("../purchase-orders/po.model"));
const vendor_model_1 = __importDefault(require("../vendors/vendor.model"));
const generateInvoiceNumber_1 = __importDefault(require("../../utils/generateInvoiceNumber"));
const pdfGenerator_1 = __importDefault(require("../../utils/pdfGenerator"));
const nodemailer_1 = require("../../config/nodemailer");
const emailTemplates_1 = __importDefault(require("../../utils/emailTemplates"));
const errorHandler_1 = require("../../middleware/errorHandler");
const notification_service_1 = __importDefault(require("../notifications/notification.service"));
const generate = async (poId, userId) => {
    const po = await po_model_1.default.findById(poId);
    if (!po)
        throw new errorHandler_1.NotFoundError('Purchase Order');
    const invoiceNumber = await (0, generateInvoiceNumber_1.default)();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const invoice = await invoice_model_1.default.create({
        invoiceNumber,
        poId: po._id,
        vendorId: po.vendorId,
        lineItems: po.lineItems,
        subtotal: po.subtotal,
        taxAmount: po.taxAmount,
        grandTotal: po.grandTotal,
        dueDate,
        status: 'generated',
        createdBy: userId,
    });
    return invoice.populate(['vendorId', 'poId']);
};
const getAll = async (query, userId, role) => {
    const filter = {};
    if (query.status)
        filter.status = query.status;
    if (role === 'Vendor') {
        const vendor = await vendor_model_1.default.findOne({ userId });
        if (vendor)
            filter.vendorId = vendor._id;
    }
    return invoice_model_1.default.find(filter)
        .populate('vendorId', 'companyName email')
        .populate('poId', 'poNumber')
        .sort('-createdAt');
};
const getById = async (id) => {
    const invoice = await invoice_model_1.default.findById(id)
        .populate('vendorId', 'companyName email contactPerson phone address')
        .populate('poId', 'poNumber terms deliveryDate')
        .populate('createdBy', 'name email');
    if (!invoice)
        throw new errorHandler_1.NotFoundError('Invoice');
    return invoice;
};
const getPDF = async (id) => {
    const invoice = await invoice_model_1.default.findById(id);
    if (!invoice)
        throw new errorHandler_1.NotFoundError('Invoice');
    return (0, pdfGenerator_1.default)(id);
};
const sendEmail = async (id, emailData) => {
    const invoice = await invoice_model_1.default.findById(id).populate('vendorId');
    if (!invoice)
        throw new errorHandler_1.NotFoundError('Invoice');
    const vendor = await vendor_model_1.default.findById(invoice.vendorId);
    if (!vendor)
        throw new errorHandler_1.AppError('Vendor not found', 404);
    const pdfBuffer = await (0, pdfGenerator_1.default)(id);
    const template = emailTemplates_1.default.invoiceEmail({
        recipientName: vendor.contactPerson || vendor.companyName,
        invoiceNumber: invoice.invoiceNumber,
        grandTotal: invoice.grandTotal,
        dueDate: new Date(invoice.dueDate).toLocaleDateString(),
    });
    try {
        const transporter = (0, nodemailer_1.getTransporter)();
        if (!transporter)
            throw new errorHandler_1.AppError('Email service not configured', 500);
        await transporter.sendMail({
            from: `"VendorBridge" <${process.env.GMAIL_USER}>`,
            to: emailData.to || vendor.email,
            cc: emailData.cc,
            subject: emailData.subject || template.subject,
            html: emailData.body || template.html,
            attachments: [
                {
                    filename: `${invoice.invoiceNumber}.pdf`,
                    content: pdfBuffer,
                },
            ],
        });
        invoice.emailSentAt = new Date();
        invoice.emailSentTo = emailData.to || vendor.email;
        invoice.status = 'sent';
        await invoice.save();
        await (0, notification_service_1.default)({
            userId: vendor.userId?.toString() || invoice.createdBy.toString(),
            type: 'invoice_sent',
            title: 'Invoice Sent',
            message: `Invoice ${invoice.invoiceNumber} has been sent`,
            entityId: invoice._id.toString(),
            entityType: 'Invoice',
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Failed to send email', 500);
    }
    return invoice;
};
const updateStatus = async (id, status) => {
    const validTransitions = {
        generated: ['sent', 'paid', 'overdue'],
        sent: ['paid', 'overdue'],
        paid: [],
        overdue: ['paid'],
    };
    const invoice = await invoice_model_1.default.findById(id);
    if (!invoice)
        throw new errorHandler_1.NotFoundError('Invoice');
    if (!validTransitions[invoice.status]?.includes(status)) {
        throw new errorHandler_1.AppError(`Cannot transition from ${invoice.status} to ${status}`, 400);
    }
    invoice.status = status;
    return invoice.save();
};
exports.default = { generate, getAll, getById, getPDF, sendEmail, updateStatus };
//# sourceMappingURL=invoice.service.js.map