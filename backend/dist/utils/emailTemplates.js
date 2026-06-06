"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emailTemplates = {
    rFQInvite: (data) => ({
        subject: `RFQ Invitation: ${data.rfqTitle}`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#2563eb;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;">VendorBridge</h1>
        </div>
        <div style="padding:30px;background:#f9fafb;">
          <h2>Request for Quotation</h2>
          <p>Dear ${data.recipientName},</p>
          <p>You have been invited to submit a quotation for the following RFQ:</p>
          <div style="background:white;padding:20px;border-radius:8px;margin:20px 0;">
            <h3 style="margin:0 0 10px;">${data.rfqTitle}</h3>
            <p><strong>RFQ #:</strong> ${data.rfqNumber}</p>
            <p><strong>Category:</strong> ${data.category}</p>
            <p><strong>Deadline:</strong> ${data.deadline}</p>
            <p style="color:#666;">${data.description}</p>
          </div>
          <p>Please log in to VendorBridge to submit your quotation before the deadline.</p>
          <a href="${process.env.FRONTEND_URL}/bids" 
             style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:15px;">
            Submit Quotation
          </a>
        </div>
        <div style="padding:20px;text-align:center;color:#999;font-size:12px;">
          <p>VendorBridge Procurement System</p>
        </div>
      </div>
    `,
    }),
    approvalResult: (data) => ({
        subject: `Approval ${data.status === 'approved' ? 'Approved' : 'Rejected'} - ${data.rfqTitle}`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:${data.status === 'approved' ? '#059669' : '#dc2626'};padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;">VendorBridge</h1>
        </div>
        <div style="padding:30px;background:#f9fafb;">
          <h2>Approval ${data.status === 'approved' ? 'Approved' : 'Rejected'}</h2>
          <p>Dear ${data.recipientName},</p>
          <p>The approval request for <strong>${data.rfqTitle}</strong> has been <strong>${data.status}</strong>.</p>
          ${data.remarks ? `<div style="background:white;padding:15px;border-radius:8px;margin:15px 0;border-left:4px solid #2563eb;"><p><strong>Remarks:</strong> ${data.remarks}</p></div>` : ''}
          ${data.status === 'approved' ? '<p>A Purchase Order will be generated shortly.</p>' : ''}
        </div>
      </div>
    `,
    }),
    invoiceEmail: (data) => ({
        subject: `Invoice ${data.invoiceNumber} from VendorBridge`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#2563eb;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;">VendorBridge</h1>
        </div>
        <div style="padding:30px;background:#f9fafb;">
          <h2>Invoice Generated</h2>
          <p>Dear ${data.recipientName},</p>
          <p>Please find attached the invoice <strong>${data.invoiceNumber}</strong>.</p>
          <div style="background:white;padding:20px;border-radius:8px;margin:20px 0;">
            <p><strong>Invoice #:</strong> ${data.invoiceNumber}</p>
            <p><strong>Amount:</strong> $${data.grandTotal.toFixed(2)}</p>
            <p><strong>Due Date:</strong> ${data.dueDate}</p>
          </div>
          <p>Please process the payment before the due date.</p>
        </div>
      </div>
    `,
    }),
};
exports.default = emailTemplates;
//# sourceMappingURL=emailTemplates.js.map