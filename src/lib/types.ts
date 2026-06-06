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

export interface LineItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
}

export interface RFQ {
  id: string;
  code: string; // RFQ-2026-001
  title: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  lineItems: LineItem[];
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

// ── Enterprise Feature Types ─────────────────────────────────────

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type FraudAlertType =
  | "duplicate_vendor"
  | "abnormal_pricing"
  | "gst_duplication"
  | "suspicious_quotation"
  | "procurement_anomaly";

export interface FraudAlert {
  id: string;
  vendorId?: string;
  rfqId?: string;
  quotationId?: string;
  type: FraudAlertType;
  riskLevel: RiskLevel;
  description: string;
  detectedAt: string;
  dismissed: boolean;
}

export interface VendorPerformance {
  vendorId: string;
  deliveryScore: number;   // 0-100
  qualityScore: number;
  responseScore: number;
  complianceScore: number;
  overallScore: number;
  lastUpdated: string;
}

export type ContractStatus = "Active" | "Expired" | "Terminated" | "Renewed";

export interface ContractDocument {
  name: string;
  size: number;
  uploadedAt: string;
}

export interface ContractHistoryEntry {
  action: string;
  by: string;
  at: string;
  notes?: string;
}

export interface Contract {
  id: string;
  code: string;
  vendorId: string;
  poId?: string;
  title: string;
  startDate: string;
  endDate: string;
  value: number;
  status: ContractStatus;
  renewalAlert: boolean;
  documents: ContractDocument[];
  notes: string;
  createdAt: string;
  createdBy: string;
  history: ContractHistoryEntry[];
}

export type ApprovalLevelStatus = "Pending" | "Approved" | "Rejected" | "Skipped";

export interface ApprovalLevel {
  level: number;
  role: string;
  approverName: string;
  status: ApprovalLevelStatus;
  remarks?: string;
  decidedAt?: string;
}

export interface MultiLevelApproval extends Approval {
  levels: ApprovalLevel[];
  currentLevel: number;
}

export interface SavingsRecord {
  id: string;
  rfqId: string;
  rfqCode: string;
  rfqBudget: number;
  approvedCost: number;
  savings: number;
  savingsPct: number;
  month: string;
  vendorId: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
