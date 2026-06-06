import type {
  ActivityLog, Approval, Invoice, Notification, PurchaseOrder, Quotation, RFQ, User, Vendor,
} from "./types";

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();
const daysAhead = (d: number) => new Date(now + d * 86400000).toISOString();

export const seedVendors: Vendor[] = [
  { id: "v1", company: "Acme Industrial Supplies", gst: "27AAACI1234F1Z5", email: "sales@acme.io", phone: "+91 98765 43210", address: "Plot 22, MIDC, Pune", contactPerson: "Ravi Menon", category: "Industrial", status: "Active", rating: 4.6, createdAt: daysAgo(120) },
  { id: "v2", company: "Nimbus Office Solutions", gst: "29AABCN5678K2Z9", email: "hello@nimbus.co", phone: "+91 90000 11122", address: "Indiranagar, Bangalore", contactPerson: "Asha Pillai", category: "Office", status: "Active", rating: 4.2, createdAt: daysAgo(95) },
  { id: "v3", company: "Helix Tech Components", gst: "07AAGCH9911J3Z1", email: "contact@helixtech.com", phone: "+91 98111 22233", address: "Okhla, New Delhi", contactPerson: "Devansh Roy", category: "Electronics", status: "Active", rating: 4.8, createdAt: daysAgo(60) },
  { id: "v4", company: "Granite & Co Construction", gst: "24AAFCG2233L1Z2", email: "po@granite.in", phone: "+91 79404 55667", address: "Vastrapur, Ahmedabad", contactPerson: "Meera Shah", category: "Construction", status: "Inactive", rating: 3.4, createdAt: daysAgo(220) },
  { id: "v5", company: "Sunrise Logistics", gst: "33AAFCS7788M1Z6", email: "ops@sunrise.com", phone: "+91 90000 77889", address: "Guindy, Chennai", contactPerson: "Karthik Iyer", category: "Logistics", status: "Active", rating: 4.0, createdAt: daysAgo(40) },
];

export const seedRFQs: RFQ[] = [
  {
    id: "r1", code: "RFQ-2026-001", title: "Laptops for Engineering Team",
    category: "Electronics",
    description: "30 units of mid-tier business laptops, 16GB RAM, SSD 512GB.",
    quantity: 30, unit: "units",
    lineItems: [
      { id: "li1", name: "Business Laptop 16GB RAM", qty: 25, unit: "NOS" },
      { id: "li2", name: "Laptop Bags", qty: 25, unit: "NOS" },
      { id: "li3", name: "USB-C Docking Station", qty: 10, unit: "NOS" },
    ],
    deadline: daysAhead(5), status: "Open", assignedVendorIds: ["v2", "v3"],
    attachments: [{ name: "specs.pdf", size: 184320 }], createdAt: daysAgo(6), createdBy: "u2",
  },
  {
    id: "r2", code: "RFQ-2026-002", title: "Steel Bars Q1 Restock",
    category: "Industrial",
    description: "TMT bars Fe 550, 12mm and 16mm.",
    quantity: 5000, unit: "kg",
    lineItems: [
      { id: "li4", name: "TMT Bar 12mm Fe550", qty: 3000, unit: "kg" },
      { id: "li5", name: "TMT Bar 16mm Fe550", qty: 2000, unit: "kg" },
    ],
    deadline: daysAhead(10), status: "Open", assignedVendorIds: ["v1", "v4"],
    attachments: [], createdAt: daysAgo(3), createdBy: "u2",
  },
  {
    id: "r3", code: "RFQ-2026-003", title: "Office Furniture - 4th Floor",
    category: "Furniture",
    description: "Workstations, ergonomic chairs, meeting tables.",
    quantity: 40, unit: "sets",
    lineItems: [
      { id: "li6", name: "Ergonomic Chair", qty: 25, unit: "NOS" },
      { id: "li7", name: "Standing Desk", qty: 10, unit: "NOS" },
      { id: "li8", name: "Meeting Table (8-seater)", qty: 2, unit: "NOS" },
    ],
    deadline: daysAhead(14), status: "Awarded", assignedVendorIds: ["v2"],
    attachments: [], createdAt: daysAgo(28), createdBy: "u2",
  },
  {
    id: "r4", code: "RFQ-2026-004", title: "Last-mile Delivery Contract",
    category: "Logistics",
    description: "3-month pilot for inter-city same-day delivery.",
    quantity: 1, unit: "contract",
    lineItems: [
      { id: "li9", name: "Same-day City Delivery", qty: 1, unit: "Contract" },
    ],
    deadline: daysAhead(2), status: "Open", assignedVendorIds: ["v5"],
    attachments: [], createdAt: daysAgo(1), createdBy: "u2",
  },
];

export const seedQuotations: Quotation[] = [
  { id: "q1", rfqId: "r1", vendorId: "v2", price: 1545000, deliveryDays: 14, notes: "Includes 1yr onsite support.", submittedAt: daysAgo(4), status: "Submitted" },
  { id: "q2", rfqId: "r1", vendorId: "v3", price: 1488000, deliveryDays: 21, notes: "Premium SLA available.", submittedAt: daysAgo(3), status: "Submitted" },
  { id: "q3", rfqId: "r2", vendorId: "v1", price: 312500, deliveryDays: 7, notes: "Free delivery in MH.", submittedAt: daysAgo(2), status: "Submitted" },
  { id: "q4", rfqId: "r2", vendorId: "v4", price: 305000, deliveryDays: 12, notes: "", submittedAt: daysAgo(2), status: "Submitted" },
  { id: "q5", rfqId: "r3", vendorId: "v2", price: 880000, deliveryDays: 20, notes: "Includes installation.", submittedAt: daysAgo(20), status: "Selected" },
];

export const seedApprovals: Approval[] = [
  { id: "a1", module: "PO", refId: "po-pending-1", refLabel: "PO for RFQ-2026-001 (Helix Tech)", amount: 1488000, requestedBy: "Priya N.", status: "Pending", createdAt: daysAgo(1) },
  { id: "a2", module: "PO", refId: "po1", refLabel: "PO-2026-001 — Nimbus Office", amount: 880000, requestedBy: "Priya N.", status: "Approved", remarks: "Within budget.", createdAt: daysAgo(18), decidedAt: daysAgo(17), decidedBy: "Manager Rao" },
  { id: "a3", module: "Invoice", refId: "inv1", refLabel: "INV-2026-001 — Nimbus Office", amount: 1038400, requestedBy: "Priya N.", status: "Pending", createdAt: daysAgo(2) },
];

export const seedPOs: PurchaseOrder[] = [
  { id: "po1", code: "PO-2026-001", vendorId: "v2", quotationId: "q5", rfqId: "r3", totalAmount: 880000, status: "Fulfilled", createdAt: daysAgo(17) },
];

export const seedInvoices: Invoice[] = [
  { id: "inv1", code: "INV-2026-001", poId: "po1", vendorId: "v2", subtotal: 880000, taxRate: 18, tax: 158400, total: 1038400, status: "Sent", createdAt: daysAgo(10), dueDate: daysAhead(20) },
];

export const seedNotifications: Notification[] = [
  { id: "n1", type: "quotation", message: "Helix Tech submitted a quotation for RFQ-2026-001", read: false, createdAt: daysAgo(3) },
  { id: "n2", type: "approval", message: "PO approval pending for Helix Tech — ₹14,88,000", read: false, createdAt: daysAgo(1) },
  { id: "n3", type: "invoice", message: "INV-2026-001 sent to Nimbus Office", read: true, createdAt: daysAgo(10) },
  { id: "n4", type: "rfq", message: "RFQ-2026-004 deadline in 2 days", read: false, createdAt: daysAgo(1) },
];

export const seedActivity: ActivityLog[] = [
  { id: "l1", user: "Priya N.", action: "Created RFQ-2026-004", module: "RFQ", createdAt: daysAgo(1) },
  { id: "l2", user: "Manager Rao", action: "Approved PO-2026-001", module: "Approval", createdAt: daysAgo(17) },
  { id: "l3", user: "Helix Tech", action: "Submitted quotation for RFQ-2026-001", module: "Quotation", createdAt: daysAgo(3) },
  { id: "l4", user: "Priya N.", action: "Generated INV-2026-001", module: "Invoice", createdAt: daysAgo(10) },
];

export const seedUsers: User[] = [
  { id: "u1", name: "Admin User", email: "admin@vendorbridge.io", role: "Admin" },
  { id: "u2", name: "Priya Nair", email: "priya@vendorbridge.io", role: "Procurement Officer" },
  { id: "u3", name: "Devansh Roy", email: "contact@helixtech.com", role: "Vendor", vendorId: "v3" },
  { id: "u4", name: "Manager Rao", email: "rao@vendorbridge.io", role: "Manager" },
];

export const monthlySpending = [
  { month: "Jul", spend: 480000 },
  { month: "Aug", spend: 720000 },
  { month: "Sep", spend: 540000 },
  { month: "Oct", spend: 980000 },
  { month: "Nov", spend: 1240000 },
  { month: "Dec", spend: 1038400 },
];

export const procurementTrend = [
  { month: "Jul", rfqs: 4, pos: 3 },
  { month: "Aug", rfqs: 6, pos: 5 },
  { month: "Sep", rfqs: 5, pos: 4 },
  { month: "Oct", rfqs: 8, pos: 6 },
  { month: "Nov", rfqs: 11, pos: 9 },
  { month: "Dec", rfqs: 9, pos: 7 },
];

import type {
  FraudAlert, VendorPerformance, Contract, SavingsRecord,
} from "./types";

export const seedFraudAlerts: FraudAlert[] = [
  {
    id: "fa1", vendorId: "v4", rfqId: "r2", quotationId: "q4",
    type: "abnormal_pricing", riskLevel: "High",
    description: "Quotation from Granite & Co is 18% below market rate — potential bid manipulation or low-quality materials.",
    detectedAt: daysAgo(2), dismissed: false,
  },
  {
    id: "fa2", vendorId: "v4",
    type: "gst_duplication", riskLevel: "Critical",
    description: "GST number 24AAFCG2233L1Z2 (Granite & Co) matches a flagged entity in the national procurement watchlist.",
    detectedAt: daysAgo(3), dismissed: false,
  },
  {
    id: "fa3", vendorId: "v2", rfqId: "r1",
    type: "suspicious_quotation", riskLevel: "Medium",
    description: "Nimbus Office Solutions submitted a quotation ₹57,000 above their historical average for similar RFQs.",
    detectedAt: daysAgo(5), dismissed: false,
  },
  {
    id: "fa4",
    type: "procurement_anomaly", riskLevel: "Low",
    description: "Unusual spike in RFQ creation (4 RFQs in 1 day) detected — may indicate process bypass.",
    detectedAt: daysAgo(7), dismissed: true,
  },
];

export const seedVendorPerformance: VendorPerformance[] = [
  { vendorId: "v1", deliveryScore: 91, qualityScore: 88, responseScore: 85, complianceScore: 90, overallScore: 88.5, lastUpdated: daysAgo(2) },
  { vendorId: "v2", deliveryScore: 82, qualityScore: 86, responseScore: 78, complianceScore: 84, overallScore: 82.5, lastUpdated: daysAgo(2) },
  { vendorId: "v3", deliveryScore: 95, qualityScore: 96, responseScore: 92, complianceScore: 95, overallScore: 94.5, lastUpdated: daysAgo(2) },
  { vendorId: "v4", deliveryScore: 55, qualityScore: 60, responseScore: 48, complianceScore: 50, overallScore: 53.3, lastUpdated: daysAgo(2) },
  { vendorId: "v5", deliveryScore: 78, qualityScore: 74, responseScore: 80, complianceScore: 77, overallScore: 77.3, lastUpdated: daysAgo(2) },
];

export const seedContracts: Contract[] = [
  {
    id: "c1", code: "CON-2026-001", vendorId: "v2", poId: "po1",
    title: "Office Furniture Supply & Installation Agreement",
    startDate: daysAgo(17), endDate: daysAhead(348),
    value: 880000, status: "Active", renewalAlert: false,
    documents: [{ name: "contract_nimbus.pdf", size: 245760, uploadedAt: daysAgo(17) }],
    notes: "Includes 1-year maintenance warranty post installation.",
    createdAt: daysAgo(17), createdBy: "Priya Nair",
    history: [
      { action: "Contract Created", by: "Priya Nair", at: daysAgo(17) },
      { action: "Approved by Manager", by: "Manager Rao", at: daysAgo(16), notes: "Standard terms accepted." },
    ],
  },
  {
    id: "c2", code: "CON-2025-004", vendorId: "v1",
    title: "Industrial Raw Material Annual Supply",
    startDate: daysAgo(200), endDate: daysAhead(30),
    value: 4200000, status: "Active", renewalAlert: true,
    documents: [{ name: "acme_annual_contract.pdf", size: 512000, uploadedAt: daysAgo(200) }],
    notes: "Auto-renewal clause active. Review before expiry.",
    createdAt: daysAgo(200), createdBy: "Admin User",
    history: [
      { action: "Contract Created", by: "Admin User", at: daysAgo(200) },
      { action: "Renewed for 2025-26", by: "Manager Rao", at: daysAgo(150) },
    ],
  },
  {
    id: "c3", code: "CON-2025-002", vendorId: "v4",
    title: "Construction Materials Pilot Agreement",
    startDate: daysAgo(300), endDate: daysAgo(10),
    value: 1500000, status: "Expired", renewalAlert: false,
    documents: [],
    notes: "Pilot contract — not renewed due to quality issues.",
    createdAt: daysAgo(300), createdBy: "Admin User",
    history: [
      { action: "Contract Created", by: "Admin User", at: daysAgo(300) },
      { action: "Contract Expired", by: "System", at: daysAgo(10) },
    ],
  },
];

export const seedSavings: SavingsRecord[] = [
  { id: "sav1", rfqId: "r3", rfqCode: "RFQ-2026-003", rfqBudget: 1000000, approvedCost: 880000, savings: 120000, savingsPct: 12, month: "Dec", vendorId: "v2" },
  { id: "sav2", rfqId: "r1", rfqCode: "RFQ-2026-001", rfqBudget: 1700000, approvedCost: 1488000, savings: 212000, savingsPct: 12.5, month: "Dec", vendorId: "v3" },
  { id: "sav3", rfqId: "r2", rfqCode: "RFQ-2026-002", rfqBudget: 380000, approvedCost: 312500, savings: 67500, savingsPct: 17.8, month: "Nov", vendorId: "v1" },
  { id: "sav4", rfqId: "r4", rfqCode: "RFQ-2026-004", rfqBudget: 200000, approvedCost: 180000, savings: 20000, savingsPct: 10, month: "Nov", vendorId: "v5" },
];

export const monthlySavings = [
  { month: "Jul", budget: 560000, actual: 480000, savings: 80000 },
  { month: "Aug", budget: 800000, actual: 720000, savings: 80000 },
  { month: "Sep", budget: 620000, actual: 540000, savings: 80000 },
  { month: "Oct", budget: 1100000, actual: 980000, savings: 120000 },
  { month: "Nov", budget: 1400000, actual: 1240000, savings: 160000 },
  { month: "Dec", budget: 1350000, actual: 1038400, savings: 311600 },
];

