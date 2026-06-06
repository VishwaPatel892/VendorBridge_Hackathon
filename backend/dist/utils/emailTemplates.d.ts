interface EmailTemplateData {
    recipientName: string;
    [key: string]: any;
}
declare const emailTemplates: {
    rFQInvite: (data: EmailTemplateData) => {
        subject: string;
        html: string;
    };
    approvalResult: (data: EmailTemplateData) => {
        subject: string;
        html: string;
    };
    invoiceEmail: (data: EmailTemplateData) => {
        subject: string;
        html: string;
    };
};
export default emailTemplates;
//# sourceMappingURL=emailTemplates.d.ts.map