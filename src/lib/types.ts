export type Role = "Admin" | "Procurement Officer" | "Vendor" | "Manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  vendorId?: string; // when role === Vendor
}

export interface Vendor {
  id: string;
  company: string;
  gst: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  category: string;
  status: "Active" | "Inactive" | "Blacklisted";
  rating: number; // 0-5
  createdAt: string;
}

export interface RFQ {
  id: string;
  code: string; // RFQ-2026-001
  title: string;
  description: string;
  quantity: number;
  unit: string;
  deadline: string;
  status: "Draft" | "Open" | "Closed" | "Awarded";
  assignedVendorIds: string[];
  attachments: { name: string; size: number }[];
  createdAt: string;
  createdBy: string;
}

export interface Quotation {
  id: string;
  rfqId: string;
  vendorId: string;
  price: number;
  deliveryDays: number;
  notes: string;
  submittedAt: string;
  status: "Submitted" | "Selected" | "Rejected";
}

export interface Approval {
  id: string;
  module: "PO" | "RFQ" | "Invoice";
  refId: string;
  refLabel: string;
  amount?: number;
  requestedBy: string;
  status: "Pending" | "Approved" | "Rejected";
  remarks?: string;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
}

export interface PurchaseOrder {
  id: string;
  code: string; // PO-2026-001
  vendorId: string;
  quotationId: string;
  rfqId: string;
  totalAmount: number;
  status: "Issued" | "Fulfilled" | "Cancelled";
  createdAt: string;
}

export interface Invoice {
  id: string;
  code: string; // INV-2026-001
  poId: string;
  vendorId: string;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  status: "Draft" | "Sent" | "Paid";
  createdAt: string;
  dueDate: string;
}

export interface Notification {
  id: string;
  type: "rfq" | "quotation" | "approval" | "invoice" | "po";
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  module: string;
  createdAt: string;
}
