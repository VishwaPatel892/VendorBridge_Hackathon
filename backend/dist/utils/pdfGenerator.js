"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("../config/cloudinary");
const invoice_model_1 = __importDefault(require("../modules/invoices/invoice.model"));
const vendor_model_1 = __importDefault(require("../modules/vendors/vendor.model"));
const generateInvoicePDF = async (invoiceId) => {
    let puppeteer;
    try {
        puppeteer = require('puppeteer');
    }
    catch {
        throw new Error('Puppeteer not available');
    }
    const invoice = await invoice_model_1.default.findById(invoiceId).populate('poId').populate('vendorId');
    if (!invoice)
        throw new Error('Invoice not found');
    const vendor = await vendor_model_1.default.findById(invoice.vendorId);
    if (!vendor)
        throw new Error('Vendor not found');
    const lineItemsHtml = invoice.lineItems
        .map((item) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #ddd;">${item.productName}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${item.unit}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$${item.unitPrice.toFixed(2)}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$${item.totalPrice.toFixed(2)}</td>
    </tr>`)
        .join('');
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica', Arial, sans-serif; margin: 0; padding: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
        .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 5px 0 0; }
        .invoice-title { font-size: 24px; margin: 20px 0; text-align: right; }
        .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .details div { width: 48%; }
        .details h3 { color: #2563eb; margin-bottom: 5px; font-size: 14px; text-transform: uppercase; }
        .details p { margin: 3px 0; font-size: 13px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #2563eb; color: white; padding: 10px 8px; text-align: left; font-size: 13px; }
        td { padding: 8px; font-size: 13px; }
        .totals { text-align: right; margin-top: 20px; }
        .totals div { margin: 5px 0; font-size: 14px; }
        .totals .grand-total { font-size: 20px; font-weight: bold; color: #2563eb; border-top: 2px solid #333; padding-top: 10px; }
        .footer { margin-top: 50px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>VendorBridge</h1>
        <p>Procurement & Vendor Management System</p>
      </div>
      <div class="invoice-title">INVOICE</div>
      <div style="font-size:13px;color:#666;margin-bottom:20px;">
        Invoice #: ${invoice.invoiceNumber} | Date: ${new Date(invoice.createdAt).toLocaleDateString()}
      </div>
      <div class="details">
        <div>
          <h3>Bill To</h3>
          <p><strong>${vendor.companyName}</strong></p>
          <p>${vendor.contactPerson}</p>
          <p>${vendor.email}</p>
          <p>${vendor.address.street}, ${vendor.address.city}</p>
          <p>${vendor.address.state} - ${vendor.address.pincode}</p>
          ${vendor.gstNumber ? `<p>GST: ${vendor.gstNumber}</p>` : ''}
        </div>
        <div>
          <h3>Invoice Details</h3>
          <p><strong>Invoice No:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>PO No:</strong> ${invoice.poId?.poNumber || 'N/A'}</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:center;">Unit</th>
            <th style="text-align:right;">Unit Price</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHtml}
        </tbody>
      </table>
      <div class="totals">
        <div>Subtotal: $${invoice.subtotal.toFixed(2)}</div>
        <div>GST (18%): $${invoice.taxAmount.toFixed(2)}</div>
        <div class="grand-total">Grand Total: $${invoice.grandTotal.toFixed(2)}</div>
      </div>
      <div class="footer">
        <p>VendorBridge ERP - Generated on ${new Date().toLocaleString()}</p>
        <p>This is a computer-generated invoice.</p>
      </div>
    </body>
    </html>
  `;
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = Buffer.from(await page.pdf({ format: 'A4', margin: { top: '20mm', bottom: '20mm' } }));
    await browser.close();
    const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.cloudinary.uploader.upload_stream({
            resource_type: 'raw',
            folder: 'vendorbridge/invoices',
            public_id: invoice.invoiceNumber,
            format: 'pdf',
        }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result);
        });
        uploadStream.end(pdfBuffer);
    });
    invoice.pdfUrl = uploadResult.secure_url;
    await invoice.save();
    return pdfBuffer;
};
exports.default = generateInvoicePDF;
//# sourceMappingURL=pdfGenerator.js.map