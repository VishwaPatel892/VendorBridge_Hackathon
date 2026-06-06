import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  seedActivity, seedApprovals, seedInvoices, seedNotifications, seedPOs,
  seedQuotations, seedRFQs, seedUsers, seedVendors,
  seedFraudAlerts, seedVendorPerformance, seedContracts, seedSavings,
} from "./mock-data";
import type {
  ActivityLog, Approval, Invoice, Notification, PurchaseOrder, Quotation, RFQ, Role, User, Vendor,
  FraudAlert, VendorPerformance, Contract, SavingsRecord, ChatMessage, MultiLevelApproval, ApprovalLevel,
} from "./types";

interface State {
  user: User | null;
  vendors: Vendor[];
  rfqs: RFQ[];
  quotations: Quotation[];
  approvals: Approval[];
  pos: PurchaseOrder[];
  invoices: Invoice[];
  notifications: Notification[];
  activity: ActivityLog[];
  theme: "light" | "dark";
  // Enterprise features
  fraudAlerts: FraudAlert[];
  vendorPerformance: VendorPerformance[];
  contracts: Contract[];
  savings: SavingsRecord[];
  chatMessages: ChatMessage[];
  multiLevelApprovals: MultiLevelApproval[];
}

interface Actions {
  login: (email: string, role: Role) => void;
  logout: () => void;
  setTheme: (t: "light" | "dark") => void;
  addVendor: (v: Omit<Vendor, "id" | "createdAt">) => void;
  updateVendor: (id: string, patch: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  addRFQ: (r: Omit<RFQ, "id" | "code" | "createdAt" | "createdBy">) => void;
  deleteRFQ: (id: string) => void;
  sendRFQToVendors: (rfqId: string) => void;
  saveRFQAsDraft: (rfqId: string) => void;
  submitQuotation: (q: Omit<Quotation, "id" | "submittedAt" | "status">) => void;
  decideApproval: (id: string, status: "Approved" | "Rejected", remarks?: string) => void;
  createPOFromQuotation: (quotationId: string) => PurchaseOrder | null;
  createInvoiceFromPO: (poId: string, taxRate?: number) => Invoice | null;
  markInvoiceSent: (id: string) => void;
  markInvoicePaid: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  deleteNotification: (id: string) => void;
  pushNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  logActivity: (a: Omit<ActivityLog, "id" | "createdAt">) => void;
  // Enterprise actions
  dismissFraudAlert: (id: string) => void;
  addContract: (c: Omit<Contract, "id" | "code" | "createdAt" | "history">) => void;
  updateContract: (id: string, patch: Partial<Contract>) => void;
  terminateContract: (id: string, by: string, notes?: string) => void;
  renewContract: (id: string, newEndDate: string, by: string) => void;
  addSavingsRecord: (s: Omit<SavingsRecord, "id">) => void;
  sendChatMessage: (content: string) => void;
  advanceApprovalLevel: (approvalId: string, status: "Approved" | "Rejected", remarks?: string) => void;
  createMultiLevelApproval: (base: Omit<Approval, "id" | "createdAt" | "status">) => void;
}

const Ctx = createContext<(State & Actions) | null>(null);

const KEY = "vendorbridge.v3";

function load(): Partial<State> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

function rid(prefix = "id") { return `${prefix}_${Math.random().toString(36).slice(2, 9)}`; }

function nextCode(prefix: string, existing: { code: string }[]) {
  const year = new Date().getFullYear();
  const nums = existing
    .map((x) => parseInt(x.code.split("-").pop() || "0", 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${year}-${String(next).padStart(3, "0")}`;
}

const APPROVAL_LEVELS: ApprovalLevel[] = [
  { level: 1, role: "Procurement Officer", approverName: "Priya Nair", status: "Pending" },
  { level: 2, role: "Team Lead", approverName: "Rajesh Kumar", status: "Pending" },
  { level: 3, role: "Manager", approverName: "Manager Rao", status: "Pending" },
  { level: 4, role: "Finance", approverName: "Sunita Joshi", status: "Pending" },
  { level: 5, role: "Director", approverName: "Director Mehta", status: "Pending" },
];

function buildMultiLevelApprovals(approvals: Approval[]): MultiLevelApproval[] {
  return approvals.map((a) => ({
    ...a,
    levels: APPROVAL_LEVELS.map((l) => {
      if (a.status === "Approved" && l.level <= 3) {
        return { ...l, status: "Approved" as const, decidedAt: a.decidedAt, remarks: a.remarks };
      }
      if (a.status === "Rejected" && l.level === 1) {
        return { ...l, status: "Rejected" as const, decidedAt: a.decidedAt, remarks: a.remarks };
      }
      return { ...l };
    }),
    currentLevel: a.status === "Approved" ? 4 : a.status === "Rejected" ? 1 : 1,
  }));
}

function generateChatReply(content: string, state: State): string {
  const q = content.toLowerCase();
  const { rfqs, approvals, invoices, vendors, quotations, pos, savings } = state;

  if (q.includes("pending") && q.includes("rfq")) {
    const open = rfqs.filter((r) => r.status === "Open").length;
    return `You currently have **${open} open RFQ(s)** awaiting vendor quotations. ${open > 0 ? "Would you like me to list them?" : "All RFQs are up to date!"}`;
  }
  if (q.includes("approval") || q.includes("approve")) {
    const pending = approvals.filter((a) => a.status === "Pending").length;
    return `There are **${pending} approval(s)** currently pending action. Head to the Approvals module to review and decide.`;
  }
  if (q.includes("invoice")) {
    const unpaid = invoices.filter((i) => i.status !== "Paid").length;
    const total = invoices.reduce((s, i) => s + i.total, 0);
    return `You have **${unpaid} unpaid invoice(s)** out of ${invoices.length} total. Total invoice value is ₹${total.toLocaleString("en-IN")}.`;
  }
  if (q.includes("vendor")) {
    const active = vendors.filter((v) => v.status === "Active").length;
    return `There are **${active} active vendor(s)** registered in the system out of ${vendors.length} total. Top rated: ${vendors.sort((a, b) => b.rating - a.rating)[0]?.company}.`;
  }
  if (q.includes("spend") || q.includes("budget") || q.includes("cost")) {
    const totalSpend = invoices.reduce((s, i) => s + i.total, 0);
    const totalSavings = savings.reduce((s, r) => s + r.savings, 0);
    return `Total procurement spend this period: **₹${totalSpend.toLocaleString("en-IN")}**. Savings achieved: ₹${totalSavings.toLocaleString("en-IN")} — great work optimizing costs!`;
  }
  if (q.includes("quotation") || q.includes("quote")) {
    const submitted = quotations.filter((q) => q.status === "Submitted").length;
    return `There are **${submitted} quotation(s)** submitted and under review. ${submitted > 0 ? "Visit the Quotations module for AI-powered vendor recommendations." : "No pending quotations at this time."}`;
  }
  if (q.includes("po") || q.includes("purchase order")) {
    const issued = pos.filter((p) => p.status === "Issued").length;
    return `**${issued} Purchase Order(s)** are currently issued and awaiting fulfilment.`;
  }
  if (q.includes("fraud") || q.includes("alert") || q.includes("risk")) {
    const alerts = state.fraudAlerts.filter((a) => !a.dismissed);
    const critical = alerts.filter((a) => a.riskLevel === "Critical").length;
    const high = alerts.filter((a) => a.riskLevel === "High").length;
    return `Fraud Detection: **${critical} Critical** and **${high} High** risk alerts are active. Please review the flagged vendors in the quotations module immediately.`;
  }
  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return `Hello! 👋 I'm your VendorBridge AI Procurement Assistant. I can help you with:\n- Pending RFQs & approvals\n- Invoice status & spend analytics\n- Vendor information & performance\n- Fraud alerts & risk summary\n\nWhat would you like to know?`;
  }
  if (q.includes("help") || q.includes("what can you")) {
    return `I can answer questions about:\n- **RFQs** — "How many open RFQs?"\n- **Approvals** — "How many pending approvals?"\n- **Invoices** — "What are unpaid invoices?"\n- **Vendors** — "How many active vendors?"\n- **Spend** — "What's our total spend?"\n- **Fraud** — "Any fraud alerts?"\n- **Purchase Orders** — "How many issued POs?"\n\nJust ask naturally!`;
  }
  return `I understand you're asking about "${content}". For detailed procurement insights, please navigate to the relevant module. I'm best at answering questions about RFQs, approvals, invoices, vendors, spend, and fraud alerts. Try asking "How many pending approvals?" or "What's our total spend?"`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<State>({
    user: null,
    vendors: seedVendors,
    rfqs: seedRFQs,
    quotations: seedQuotations,
    approvals: seedApprovals,
    pos: seedPOs,
    invoices: seedInvoices,
    notifications: seedNotifications,
    activity: seedActivity,
    theme: "light",
    fraudAlerts: seedFraudAlerts,
    vendorPerformance: seedVendorPerformance,
    contracts: seedContracts,
    savings: seedSavings,
    chatMessages: [],
    multiLevelApprovals: buildMultiLevelApprovals(seedApprovals),
  });

  useEffect(() => {
    const persisted = load();
    setState((s) => ({ ...s, ...persisted }));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(state));
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state, hydrated]);

  const actions: Actions = useMemo(() => ({
    login(email, role) {
      const existing = seedUsers.find((u) => u.role === role);
      const user: User = existing
        ? { ...existing, email: email || existing.email }
        : { id: rid("u"), name: email.split("@")[0] || "User", email, role };
      setState((s) => ({ ...s, user }));
    },
    logout() { setState((s) => ({ ...s, user: null })); },
    setTheme(t) { setState((s) => ({ ...s, theme: t })); },

    addVendor(v) {
      setState((s) => ({ ...s, vendors: [{ ...v, id: rid("v"), createdAt: new Date().toISOString() }, ...s.vendors] }));
    },
    updateVendor(id, patch) {
      setState((s) => ({ ...s, vendors: s.vendors.map((v) => v.id === id ? { ...v, ...patch } : v) }));
    },
    deleteVendor(id) {
      setState((s) => ({ ...s, vendors: s.vendors.filter((v) => v.id !== id) }));
    },

    addRFQ(r) {
      setState((s) => {
        const code = nextCode("RFQ", s.rfqs);
        const rfq: RFQ = { ...r, id: rid("r"), code, createdAt: new Date().toISOString(), createdBy: s.user?.id || "u2" };
        return {
          ...s,
          rfqs: [rfq, ...s.rfqs],
          notifications: [{ id: rid("n"), type: "rfq", message: `${code} created — ${r.assignedVendorIds.length} vendor(s) notified`, read: false, createdAt: new Date().toISOString() }, ...s.notifications],
          activity: [{ id: rid("l"), user: s.user?.name || "User", action: `Created ${code}`, module: "RFQ", createdAt: new Date().toISOString() }, ...s.activity],
        };
      });
    },
    deleteRFQ(id) {
      setState((s) => ({ ...s, rfqs: s.rfqs.filter((r) => r.id !== id) }));
    },

    sendRFQToVendors(rfqId) {
      setState((s) => {
        const rfq = s.rfqs.find((r) => r.id === rfqId);
        if (!rfq) return s;
        const assignedVendors = s.vendors.filter((v) => rfq.assignedVendorIds.includes(v.id));
        const newNotifications = assignedVendors.map((v) => ({
          id: rid("n"),
          type: "rfq" as const,
          message: `${rfq.code} — ${rfq.title} has been sent to you for quotation`,
          read: false,
          createdAt: new Date().toISOString(),
        }));
        return {
          ...s,
          rfqs: s.rfqs.map((r) => r.id === rfqId ? { ...r, status: "Open" } : r),
          notifications: [...newNotifications, ...s.notifications],
          activity: [{
            id: rid("l"),
            user: s.user?.name || "Officer",
            action: `Sent ${rfq.code} to ${assignedVendors.length} vendor(s)`,
            module: "RFQ",
            createdAt: new Date().toISOString(),
          }, ...s.activity],
        };
      });
    },

    saveRFQAsDraft(rfqId) {
      setState((s) => {
        const rfq = s.rfqs.find((r) => r.id === rfqId);
        if (!rfq) return s;
        return {
          ...s,
          rfqs: s.rfqs.map((r) => r.id === rfqId ? { ...r, status: "Draft" } : r),
          activity: [{
            id: rid("l"),
            user: s.user?.name || "Officer",
            action: `Saved ${rfq.code} as Draft`,
            module: "RFQ",
            createdAt: new Date().toISOString(),
          }, ...s.activity],
        };
      });
    },

    submitQuotation(q) {
      setState((s) => {
        const quotation: Quotation = { ...q, id: rid("q"), submittedAt: new Date().toISOString(), status: "Submitted" };
        const rfq = s.rfqs.find((r) => r.id === q.rfqId);
        const vendor = s.vendors.find((v) => v.id === q.vendorId);
        return {
          ...s,
          quotations: [quotation, ...s.quotations],
          notifications: [{ id: rid("n"), type: "quotation", message: `${vendor?.company || "Vendor"} submitted a quotation for ${rfq?.code}`, read: false, createdAt: new Date().toISOString() }, ...s.notifications],
          activity: [{ id: rid("l"), user: vendor?.company || "Vendor", action: `Submitted quotation for ${rfq?.code}`, module: "Quotation", createdAt: new Date().toISOString() }, ...s.activity],
        };
      });
    },

    decideApproval(id, status, remarks) {
      setState((s) => ({
        ...s,
        approvals: s.approvals.map((a) =>
          a.id === id ? { ...a, status, remarks, decidedAt: new Date().toISOString(), decidedBy: s.user?.name || "Manager" } : a
        ),
        multiLevelApprovals: s.multiLevelApprovals.map((a) =>
          a.id === id ? { ...a, status, remarks, decidedAt: new Date().toISOString(), decidedBy: s.user?.name || "Manager" } : a
        ),
        notifications: [{ id: rid("n"), type: "approval", message: `Approval ${status.toLowerCase()}: ${s.approvals.find((a) => a.id === id)?.refLabel}`, read: false, createdAt: new Date().toISOString() }, ...s.notifications],
        activity: [{ id: rid("l"), user: s.user?.name || "Manager", action: `${status} ${s.approvals.find((a) => a.id === id)?.refLabel}`, module: "Approval", createdAt: new Date().toISOString() }, ...s.activity],
      }));
    },

    advanceApprovalLevel(approvalId, status, remarks) {
      setState((s) => ({
        ...s,
        multiLevelApprovals: s.multiLevelApprovals.map((a) => {
          if (a.id !== approvalId) return a;
          const now = new Date().toISOString();
          const updatedLevels = a.levels.map((l) =>
            l.level === a.currentLevel
              ? { ...l, status, remarks, decidedAt: now }
              : l
          );
          const nextLevel = status === "Approved" ? a.currentLevel + 1 : a.currentLevel;
          const isFullyApproved = status === "Approved" && a.currentLevel >= 5;
          return {
            ...a,
            levels: updatedLevels,
            currentLevel: nextLevel,
            status: isFullyApproved ? "Approved" : status === "Rejected" ? "Rejected" : "Pending",
            decidedAt: isFullyApproved || status === "Rejected" ? now : undefined,
            decidedBy: s.user?.name || "Manager",
          };
        }),
        approvals: s.approvals.map((a) => {
          if (a.id !== approvalId) return a;
          const ml = s.multiLevelApprovals.find((m) => m.id === approvalId);
          if (!ml) return a;
          return { ...a, status: ml.currentLevel >= 5 && status === "Approved" ? "Approved" : status === "Rejected" ? "Rejected" : "Pending" };
        }),
        notifications: [{ id: rid("n"), type: "approval", message: `Approval level ${s.multiLevelApprovals.find((a) => a.id === approvalId)?.currentLevel} ${status.toLowerCase()} by ${s.user?.name}`, read: false, createdAt: new Date().toISOString() }, ...s.notifications],
      }));
    },

    createMultiLevelApproval(base) {
      setState((s) => {
        const id = rid("a");
        const now = new Date().toISOString();
        const approval: Approval = { ...base, id, status: "Pending", createdAt: now };
        const multi: MultiLevelApproval = {
          ...approval,
          levels: APPROVAL_LEVELS.map((l) => ({ ...l, status: "Pending" as const })),
          currentLevel: 1,
        };
        return {
          ...s,
          approvals: [approval, ...s.approvals],
          multiLevelApprovals: [multi, ...s.multiLevelApprovals],
          notifications: [{ id: rid("n"), type: "approval", message: `New multi-level approval initiated: ${base.refLabel}`, read: false, createdAt: now }, ...s.notifications],
        };
      });
    },

    createPOFromQuotation(quotationId) {
      let created: PurchaseOrder | null = null;
      setState((s) => {
        const q = s.quotations.find((x) => x.id === quotationId);
        if (!q) return s;
        const code = nextCode("PO", s.pos);
        created = { id: rid("po"), code, vendorId: q.vendorId, quotationId: q.id, rfqId: q.rfqId, totalAmount: q.price, status: "Issued", createdAt: new Date().toISOString() };
        const rfq = s.rfqs.find((r) => r.id === q.rfqId);
        return {
          ...s,
          pos: [created!, ...s.pos],
          quotations: s.quotations.map((x) => x.id === q.id ? { ...x, status: "Selected" } : x.rfqId === q.rfqId ? { ...x, status: "Rejected" } : x),
          rfqs: s.rfqs.map((r) => r.id === q.rfqId ? { ...r, status: "Awarded" } : r),
          approvals: [{ id: rid("a"), module: "PO", refId: created!.id, refLabel: `${code} — ${s.vendors.find((v) => v.id === q.vendorId)?.company}`, amount: q.price, requestedBy: s.user?.name || "Officer", status: "Pending", createdAt: new Date().toISOString() }, ...s.approvals],
          notifications: [{ id: rid("n"), type: "po", message: `${code} generated for ${rfq?.code}`, read: false, createdAt: new Date().toISOString() }, ...s.notifications],
          activity: [{ id: rid("l"), user: s.user?.name || "Officer", action: `Generated ${code}`, module: "PO", createdAt: new Date().toISOString() }, ...s.activity],
        };
      });
      return created;
    },

    createInvoiceFromPO(poId, taxRate = 18) {
      let created: Invoice | null = null;
      setState((s) => {
        const po = s.pos.find((p) => p.id === poId);
        if (!po) return s;
        const code = nextCode("INV", s.invoices);
        const subtotal = po.totalAmount;
        const tax = Math.round(subtotal * (taxRate / 100));
        created = { id: rid("inv"), code, poId: po.id, vendorId: po.vendorId, subtotal, taxRate, tax, total: subtotal + tax, status: "Draft", createdAt: new Date().toISOString(), dueDate: new Date(Date.now() + 30 * 86400000).toISOString() };
        return {
          ...s,
          invoices: [created!, ...s.invoices],
          notifications: [{ id: rid("n"), type: "invoice", message: `${code} generated from ${po.code}`, read: false, createdAt: new Date().toISOString() }, ...s.notifications],
          activity: [{ id: rid("l"), user: s.user?.name || "Officer", action: `Generated ${code}`, module: "Invoice", createdAt: new Date().toISOString() }, ...s.activity],
        };
      });
      return created;
    },

    markInvoiceSent(id) {
      setState((s) => ({ ...s, invoices: s.invoices.map((i) => i.id === id ? { ...i, status: "Sent" } : i) }));
    },
    markInvoicePaid(id) {
      setState((s) => ({ ...s, invoices: s.invoices.map((i) => i.id === id ? { ...i, status: "Paid" } : i) }));
    },
    markNotificationRead(id) {
      setState((s) => ({ ...s, notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }));
    },
    markAllNotificationsRead() {
      setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    },
    clearAllNotifications() {
      setState((s) => ({ ...s, notifications: [] }));
    },
    deleteNotification(id) {
      setState((s) => ({ ...s, notifications: s.notifications.filter((n) => n.id !== id) }));
    },
    pushNotification(n) {
      setState((s) => ({ ...s, notifications: [{ ...n, id: rid("n"), read: false, createdAt: new Date().toISOString() }, ...s.notifications] }));
    },
    logActivity(a) {
      setState((s) => ({ ...s, activity: [{ ...a, id: rid("l"), createdAt: new Date().toISOString() }, ...s.activity] }));
    },

    // Enterprise actions
    dismissFraudAlert(id) {
      setState((s) => ({ ...s, fraudAlerts: s.fraudAlerts.map((a) => a.id === id ? { ...a, dismissed: true } : a) }));
    },

    addContract(c) {
      setState((s) => {
        const code = nextCode("CON", s.contracts);
        const now = new Date().toISOString();
        const contract: Contract = {
          ...c, id: rid("c"), code, createdAt: now,
          history: [{ action: "Contract Created", by: s.user?.name || "Officer", at: now }],
        };
        return {
          ...s,
          contracts: [contract, ...s.contracts],
          notifications: [{ id: rid("n"), type: "po", message: `Contract ${code} created with vendor`, read: false, createdAt: now }, ...s.notifications],
          activity: [{ id: rid("l"), user: s.user?.name || "Officer", action: `Created ${code}`, module: "Contract", createdAt: now }, ...s.activity],
        };
      });
    },

    updateContract(id, patch) {
      setState((s) => ({ ...s, contracts: s.contracts.map((c) => c.id === id ? { ...c, ...patch } : c) }));
    },

    terminateContract(id, by, notes) {
      setState((s) => ({
        ...s,
        contracts: s.contracts.map((c) =>
          c.id === id
            ? { ...c, status: "Terminated" as const, history: [...c.history, { action: "Contract Terminated", by, at: new Date().toISOString(), notes }] }
            : c
        ),
      }));
    },

    renewContract(id, newEndDate, by) {
      setState((s) => ({
        ...s,
        contracts: s.contracts.map((c) =>
          c.id === id
            ? { ...c, status: "Renewed" as const, endDate: newEndDate, renewalAlert: false, history: [...c.history, { action: "Contract Renewed", by, at: new Date().toISOString() }] }
            : c
        ),
      }));
    },

    addSavingsRecord(s_rec) {
      setState((s) => ({ ...s, savings: [{ ...s_rec, id: rid("sav") }, ...s.savings] }));
    },

    sendChatMessage(content) {
      setState((s) => {
        const userMsg: ChatMessage = { id: rid("msg"), role: "user", content, timestamp: new Date().toISOString() };
        const reply = generateChatReply(content, s);
        const assistantMsg: ChatMessage = { id: rid("msg"), role: "assistant", content: reply, timestamp: new Date().toISOString() };
        return { ...s, chatMessages: [...s.chatMessages, userMsg, assistantMsg] };
      });
    },
  }), []);

  return <Ctx.Provider value={{ ...state, ...actions }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// AI vendor recommendation: 40% price, 30% delivery, 30% rating (normalized)
export function recommendVendor(quotations: Quotation[], vendors: import("./types").Vendor[], performance?: import("./types").VendorPerformance[]) {
  if (!quotations.length) return null;
  const prices = quotations.map((q) => q.price);
  const deliveries = quotations.map((q) => q.deliveryDays);
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const minD = Math.min(...deliveries), maxD = Math.max(...deliveries);
  const scored = quotations.map((q) => {
    const v = vendors.find((x) => x.id === q.vendorId);
    const perf = performance?.find((p) => p.vendorId === q.vendorId);
    const priceScore = maxP === minP ? 1 : 1 - (q.price - minP) / (maxP - minP);
    const deliveryScore = maxD === minD ? 1 : 1 - (q.deliveryDays - minD) / (maxD - minD);
    const ratingScore = (v?.rating ?? 0) / 5;
    const perfScore = perf ? perf.overallScore / 100 : ratingScore;
    const score = priceScore * 0.35 + deliveryScore * 0.25 + ratingScore * 0.2 + perfScore * 0.2;
    return { quotation: q, vendor: v, score, priceScore, deliveryScore, ratingScore, perfScore };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
