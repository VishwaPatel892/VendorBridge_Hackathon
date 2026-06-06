import nodemailer from 'nodemailer';
declare const configureNodemailer: () => Promise<void>;
declare const getTransporter: () => nodemailer.Transporter;
export { getTransporter, configureNodemailer };
//# sourceMappingURL=nodemailer.d.ts.map