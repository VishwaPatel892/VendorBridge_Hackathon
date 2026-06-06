import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  seedActivity, seedApprovals, seedInvoices, seedNotifications, seedPOs,
  seedQuotations, seedRFQs, seedUsers, seedVendors,
} from "./mock-data";
import type {
  ActivityLog, Approval, Invoice, Notification, PurchaseOrder, Quotation, RFQ, Role, User, Vendor,
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
  pushNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  logActivity: (a: Omit<ActivityLog, "id" | "createdAt">) => void;
}

const Ctx = createContext<(State & Actions) | null>(null);

const KEY = "vendorbridge.v2";

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
        notifications: [{ id: rid("n"), type: "approval", message: `Approval ${status.toLowerCase()}: ${s.approvals.find((a) => a.id === id)?.refLabel}`, read: false, createdAt: new Date().toISOString() }, ...s.notifications],
        activity: [{ id: rid("l"), user: s.user?.name || "Manager", action: `${status} ${s.approvals.find((a) => a.id === id)?.refLabel}`, module: "Approval", createdAt: new Date().toISOString() }, ...s.activity],
      }));
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
    pushNotification(n) {
      setState((s) => ({ ...s, notifications: [{ ...n, id: rid("n"), read: false, createdAt: new Date().toISOString() }, ...s.notifications] }));
    },
    logActivity(a) {
      setState((s) => ({ ...s, activity: [{ ...a, id: rid("l"), createdAt: new Date().toISOString() }, ...s.activity] }));
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
export function recommendVendor(quotations: Quotation[], vendors: Vendor[]) {
  if (!quotations.length) return null;
  const prices = quotations.map((q) => q.price);
  const deliveries = quotations.map((q) => q.deliveryDays);
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const minD = Math.min(...deliveries), maxD = Math.max(...deliveries);
  const scored = quotations.map((q) => {
    const v = vendors.find((x) => x.id === q.vendorId);
    const priceScore = maxP === minP ? 1 : 1 - (q.price - minP) / (maxP - minP);
    const deliveryScore = maxD === minD ? 1 : 1 - (q.deliveryDays - minD) / (maxD - minD);
    const ratingScore = (v?.rating ?? 0) / 5;
    const score = priceScore * 0.4 + deliveryScore * 0.3 + ratingScore * 0.3;
    return { quotation: q, vendor: v, score, priceScore, deliveryScore, ratingScore };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
