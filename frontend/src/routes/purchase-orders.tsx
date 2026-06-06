import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { formatINR, useStore } from "@/lib/store";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import {
  FileDown, Receipt, ShoppingCart, CheckCircle2,
  XCircle, Clock, TrendingUp, Search, Building2,
  CalendarDays, Hash, ChevronRight, Filter,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/purchase-orders")({
  head: () => ({ meta: [{ title: "Purchase Orders — VendorBridge" }] }),
  component: POPage,
});

const STATUS_FILTERS = ["All", "Issued", "Fulfilled", "Cancelled"] as const;

const STATUS_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Issued:    { icon: Clock,         color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-950/30" },
  Fulfilled: { icon: CheckCircle2,  color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  Cancelled: { icon: XCircle,       color: "text-red-500 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-950/30" },
};

function POPage() {
  const { pos, vendors, rfqs, invoices, user, createInvoiceFromPO } = useStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  let baseList = pos;
  if (user?.role === "Vendor" && user.vendorId)
    baseList = baseList.filter((p) => p.vendorId === user.vendorId);

  const list = useMemo(() => {
    return baseList
      .filter((p) => statusFilter === "All" || p.status === statusFilter)
      .filter((p) => {
        if (!search) return true;
        const v = vendors.find((x) => x.id === p.vendorId);
        const r = rfqs.find((x) => x.id === p.rfqId);
        return (
          p.code.toLowerCase().includes(search.toLowerCase()) ||
          v?.company.toLowerCase().includes(search.toLowerCase()) ||
          r?.code.toLowerCase().includes(search.toLowerCase())
        );
      });
  }, [baseList, statusFilter, search, vendors, rfqs]);

  // Summary stats
  const totalValue = baseList.reduce((s, p) => s + p.totalAmount, 0);
  const issued = baseList.filter((p) => p.status === "Issued").length;
  const fulfilled = baseList.filter((p) => p.status === "Fulfilled").length;
  const cancelled = baseList.filter((p) => p.status === "Cancelled").length;

  const generateInvoice = (poId: string) => {
    const inv = createInvoiceFromPO(poId);
    if (inv) {
      toast.success(`${inv.code} created successfully`);
      navigate({ to: "/invoices/$id", params: { id: inv.id } });
    }
  };

  const hasInvoice = (poId: string) => invoices.some((i) => i.poId === poId);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            POs issued from awarded quotations · Manage fulfillment and invoicing
          </p>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total POs */}
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{baseList.length}</p>
            <p className="text-xs text-muted-foreground">Total POs</p>
          </div>
        </div>
        {/* Issued */}
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30 flex-shrink-0">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{issued}</p>
            <p className="text-xs text-muted-foreground">Issued</p>
          </div>
        </div>
        {/* Fulfilled */}
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex-shrink-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{fulfilled}</p>
            <p className="text-xs text-muted-foreground">Fulfilled</p>
          </div>
        </div>
        {/* Total Value */}
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">{formatINR(totalValue)}</p>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by PO, vendor, or RFQ…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                statusFilter === s
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── PO Cards ── */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 gap-3 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-base font-medium">No purchase orders found</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            {search || statusFilter !== "All"
              ? "Try adjusting your filters."
              : "POs are created automatically when a quotation is awarded."}
          </p>
          {(search || statusFilter !== "All") && (
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setStatusFilter("All"); }}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((p) => {
            const vendor = vendors.find((x) => x.id === p.vendorId);
            const rfq = rfqs.find((x) => x.id === p.rfqId);
            const alreadyInvoiced = hasInvoice(p.id);
            const meta = STATUS_META[p.status] || STATUS_META["Issued"];
            const StatusIcon = meta.icon;

            return (
              <div
                key={p.id}
                className="group rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Top accent bar */}
                <div className={`h-1 w-full ${
                  p.status === "Fulfilled" ? "bg-emerald-500" :
                  p.status === "Cancelled" ? "bg-red-400" : "bg-primary"
                }`} />

                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Left: PO info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Status icon badge */}
                      <div className={`flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl ${meta.bg}`}>
                        <StatusIcon className={`h-5 w-5 ${meta.color}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-base font-mono tracking-tight">{p.code}</span>
                          <StatusBadge status={p.status} />
                          {alreadyInvoiced && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-950/40 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-400">
                              <Receipt className="h-2.5 w-2.5" /> Invoiced
                            </span>
                          )}
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            <span className="font-medium text-foreground">{vendor?.company || "—"}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {rfq ? (
                              <Link
                                to="/rfqs/$id"
                                params={{ id: rfq.id }}
                                className="font-medium text-primary hover:underline"
                              >
                                {rfq.code}
                              </Link>
                            ) : "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            Issued {format(new Date(p.createdAt), "dd MMM yyyy")}
                          </span>
                        </div>

                        {rfq && (
                          <p className="mt-1.5 text-xs text-muted-foreground truncate max-w-md">
                            {rfq.title}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Amount + Actions */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatINR(p.totalAmount)}</p>
                        <p className="text-xs text-muted-foreground">Order value</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 h-8 text-xs"
                          onClick={() => window.print()}
                        >
                          <FileDown className="h-3.5 w-3.5" />
                          Download PDF
                        </Button>

                        {user?.role !== "Vendor" && !alreadyInvoiced && p.status !== "Cancelled" && (
                          <Button
                            size="sm"
                            className="gap-1.5 h-8 text-xs"
                            onClick={() => generateInvoice(p.id)}
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            Generate Invoice
                          </Button>
                        )}

                        {user?.role !== "Vendor" && alreadyInvoiced && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 h-8 text-xs border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400"
                            asChild
                          >
                            <Link to="/invoices">
                              <Receipt className="h-3.5 w-3.5" />
                              View Invoice
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress pipeline */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-0">
                      {["RFQ Awarded", "PO Issued", "Fulfilled", "Invoiced"].map((step, idx) => {
                        const completed =
                          idx === 0 ? true :
                          idx === 1 ? true :
                          idx === 2 ? p.status === "Fulfilled" :
                          alreadyInvoiced;
                        const active =
                          idx === 1 && p.status === "Issued" ||
                          idx === 2 && p.status === "Fulfilled" && !alreadyInvoiced ||
                          idx === 3 && alreadyInvoiced;

                        return (
                          <div key={step} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1">
                              <div className={`h-2 w-2 rounded-full transition-all ${
                                completed ? "bg-primary scale-125" : "bg-muted-foreground/30"
                              } ${active ? "ring-2 ring-primary/30 ring-offset-1" : ""}`} />
                              <span className={`text-[10px] leading-tight text-center max-w-[64px] ${
                                active ? "text-primary font-semibold" :
                                completed ? "text-foreground/70" : "text-muted-foreground/50"
                              }`}>{step}</span>
                            </div>
                            {idx < 3 && (
                              <div className={`flex-1 h-px mx-1 mb-4 ${
                                completed && idx < (alreadyInvoiced ? 3 : p.status === "Fulfilled" ? 2 : 1)
                                  ? "bg-primary" : "bg-border"
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer count ── */}
      {list.length > 0 && (
        <p className="text-xs text-muted-foreground text-center pb-2">
          Showing {list.length} of {baseList.length} purchase order{baseList.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
