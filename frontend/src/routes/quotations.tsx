import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { formatINR, recommendVendor, useStore } from "@/lib/store";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, ChevronRight, Star, Trophy, TrendingDown,
  FileText, Send, Save, Info, Plus, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/quotations")({
  head: () => ({ meta: [{ title: "Quotations — VendorBridge" }] }),
  component: QuotationsPage,
});

// ─── Vendor (Submit Quotation) view ──────────────────────────────────────────
function VendorQuotationView() {
  const { rfqs, vendors, quotations, user, submitQuotation } = useStore();

  const myRFQs = rfqs.filter(
    (r) => r.status === "Open" && user?.vendorId && r.assignedVendorIds.includes(user.vendorId)
  );

  const [selectedRfqId, setSelectedRfqId] = useState(myRFQs[0]?.id || "");
  const rfq = rfqs.find((r) => r.id === selectedRfqId);
  const alreadyQuoted = quotations.some(
    (q) => q.rfqId === selectedRfqId && q.vendorId === user?.vendorId
  );

  // Line items with unit prices
  const [lineItems, setLineItems] = useState<{ id: string; name: string; qty: number; unitPrice: number; deliveryDays: number }[]>(
    () => (rfq?.lineItems || []).map((li) => ({ id: li.id, name: li.name, qty: li.qty, unitPrice: 0, deliveryDays: 7 }))
  );
  const [gstRate, setGstRate] = useState(18);
  const [notes, setNotes] = useState("");

  const subtotal = lineItems.reduce((s, li) => s + li.qty * li.unitPrice, 0);
  const gstAmount = Math.round(subtotal * (gstRate / 100));
  const grandTotal = subtotal + gstAmount;
  const avgDelivery = lineItems.length
    ? Math.round(lineItems.reduce((s, li) => s + li.deliveryDays, 0) / lineItems.length)
    : 7;

  const handleRfqChange = (id: string) => {
    setSelectedRfqId(id);
    const r = rfqs.find((x) => x.id === id);
    setLineItems((r?.lineItems || []).map((li) => ({ id: li.id, name: li.name, qty: li.qty, unitPrice: 0, deliveryDays: 7 })));
    setNotes("");
  };

  const handleSubmit = () => {
    if (!user?.vendorId || !rfq) return;
    if (grandTotal <= 0) { toast.error("Please enter unit prices for all items"); return; }
    submitQuotation({ rfqId: rfq.id, vendorId: user.vendorId, price: grandTotal, deliveryDays: avgDelivery, notes });
    toast.success("Quotation submitted successfully!");
  };

  if (myRFQs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/40" />
        <h2 className="text-lg font-semibold">No RFQs assigned to you</h2>
        <p className="text-muted-foreground text-sm">You'll be notified when a buyer assigns an RFQ for your quotation.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submit Quotation</h1>
        {rfq && (
          <p className="text-muted-foreground mt-0.5">
            RFQ: <span className="font-medium text-foreground">{rfq.title}</span>
            {" "}— deadline {format(new Date(rfq.deadline), "dd MMMM yyyy")}
          </p>
        )}
      </div>

      {/* RFQ Selector (if multiple) */}
      {myRFQs.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {myRFQs.map((r) => (
            <button
              key={r.id}
              onClick={() => handleRfqChange(r.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                selectedRfqId === r.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:border-primary/50 hover:bg-muted"
              }`}
            >
              {r.code}
            </button>
          ))}
        </div>
      )}

      {/* RFQ Summary */}
      {rfq && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">RFQ Summary</p>
          <p className="text-sm">
            {rfq.lineItems?.map((li) => `${li.name} × ${li.qty}`).join("; ")} — category{" "}
            <span className="font-medium">{rfq.category}</span>
          </p>
        </div>
      )}

      {alreadyQuoted ? (
        <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-6 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            You have already submitted a quotation for this RFQ.
          </p>
        </div>
      ) : (
        <>
          {/* Your Quotation Table */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b bg-muted/30">
              <h2 className="font-semibold text-sm">Your Quotation</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/20 border-b">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Item</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground w-20">Qty</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground w-32">Unit Price (₹)</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground w-28">Total (₹)</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground w-28">Delivery (days)</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li, idx) => (
                    <tr key={li.id} className={`border-b last:border-0 ${idx % 2 === 1 ? "bg-muted/10" : ""}`}>
                      <td className="px-4 py-3 font-medium">{li.name}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{li.qty}</td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min={0}
                          value={li.unitPrice || ""}
                          placeholder="0"
                          className="h-8 text-center"
                          onChange={(e) => setLineItems((prev) =>
                            prev.map((x) => x.id === li.id ? { ...x, unitPrice: parseFloat(e.target.value) || 0 } : x)
                          )}
                        />
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">
                        {li.unitPrice > 0 ? formatINR(li.qty * li.unitPrice) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min={1}
                          value={li.deliveryDays}
                          className="h-8 text-center"
                          onChange={(e) => setLineItems((prev) =>
                            prev.map((x) => x.id === li.id ? { ...x, deliveryDays: parseInt(e.target.value) || 1 } : x)
                          )}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* GST + Notes + Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tax / GST %</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={gstRate}
                    className="w-28"
                    onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Notes / Terms</Label>
                <Textarea
                  rows={4}
                  value={notes}
                  placeholder="Payment terms: 30 days net..."
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Grand Total Summary */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden self-start">
              <div className="px-5 py-3.5 border-b bg-muted/30">
                <h2 className="font-semibold text-sm">Price Summary</h2>
              </div>
              <div className="px-5 py-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatINR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">GST ({gstRate}%)</span>
                  <span className="font-medium">{formatINR(gstAmount)}</span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="font-semibold">Grand Total</span>
                  <span className="text-lg font-bold text-primary">{formatINR(grandTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Avg. delivery</span>
                  <span>{avgDelivery} days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t">
            <Button onClick={handleSubmit} className="gap-1.5" disabled={grandTotal <= 0}>
              <Send className="h-4 w-4" /> Submit Quotation
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={() => toast.info("Draft saved locally")}>
              <Save className="h-4 w-4" /> Save Draft
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Buyer / Admin view ───────────────────────────────────────────────────────
function BuyerQuotationView() {
  const { rfqs, quotations, vendors, user, createPOFromQuotation, vendorPerformance, fraudAlerts } = useStore();
  const navigate = useNavigate();

  // Group quotations by RFQ
  const rfqsWithQuotes = useMemo(() => {
    return rfqs
      .map((rfq) => {
        const quotes = quotations.filter((q) => q.rfqId === rfq.id);
        return { rfq, quotes };
      })
      .filter((x) => x.quotes.length > 0);
  }, [rfqs, quotations]);

  const [selectedRfqId, setSelectedRfqId] = useState(rfqsWithQuotes[0]?.rfq.id || "");
  const current = rfqsWithQuotes.find((x) => x.rfq.id === selectedRfqId);

  const scored = useMemo(
    () => (current ? recommendVendor(current.quotes, vendors, vendorPerformance) || [] : []),
    [current, vendors, vendorPerformance]
  );

  const award = (quotationId: string) => {
    const po = createPOFromQuotation(quotationId);
    if (po) {
      toast.success(`${po.code} created and sent for approval`);
      navigate({ to: "/purchase-orders" });
    }
  };

  if (rfqsWithQuotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/40" />
        <h2 className="text-lg font-semibold">No quotations received yet</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Quotations will appear here once vendors submit their responses to your RFQs.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link to="/rfqs">View RFQs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quotation Comparison</h1>
        {current && (
          <p className="text-muted-foreground mt-0.5">
            RFQ: <span className="font-medium text-foreground">{current.rfq.title}</span>
            {" "}— <span className="text-primary font-medium">{current.quotes.length} quotation{current.quotes.length !== 1 ? "s" : ""} received</span>
          </p>
        )}
      </div>

      {/* RFQ Tabs */}
      {rfqsWithQuotes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {rfqsWithQuotes.map(({ rfq, quotes }) => (
            <button
              key={rfq.id}
              onClick={() => setSelectedRfqId(rfq.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                selectedRfqId === rfq.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:border-primary/50 hover:bg-muted"
              }`}
            >
              {rfq.code}
              <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                selectedRfqId === rfq.id ? "bg-primary-foreground/20" : "bg-muted"
              }`}>{quotes.length}</span>
            </button>
          ))}
        </div>
      )}

      {current && scored.length > 0 && (() => {
        const lowestPrice = Math.min(...scored.map((s) => s.quotation.price));
        const bestIdx = 0; // scored is already sorted by score desc
        const bestOption = scored[0];

        // Active fraud alerts for vendors in this list
        const activeAlerts = fraudAlerts.filter(
          (a) => !a.dismissed && scored.some((s) => s.vendor?.id === a.vendorId)
        );

        return (
          <>
            {/* AI Recommendation Spotlight Panel */}
            {bestOption && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"><Trophy className="h-3 w-3" /></span>
                    <h3 className="font-bold text-base text-foreground">AI Best-Value Recommendation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on price (35%), delivery (25%), standard rating (20%), and performance history (20%).
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Recommended: <span className="text-primary font-semibold">{bestOption.vendor?.company}</span>
                    {" "}— overall score <span className="font-mono text-primary font-semibold">{(bestOption.score * 100).toFixed(0)}/100</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {scored.map((s, idx) => (
                    <div key={s.quotation.id} className={`rounded-lg border px-3 py-2 text-xs bg-card space-y-1 min-w-[120px] ${idx === 0 ? "ring-2 ring-primary border-transparent" : "opacity-80"}`}>
                      <div className="font-semibold text-foreground flex items-center justify-between gap-1.5">
                        <span className="truncate">{s.vendor?.company.split(" ")[0]}</span>
                        <span className="font-mono font-bold text-primary">{(s.score * 100).toFixed(0)}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground space-y-0.5">
                        <div className="flex justify-between"><span>Price:</span> <span>{(s.priceScore * 100).toFixed(0)}</span></div>
                        <div className="flex justify-between"><span>Delivery:</span> <span>{(s.deliveryScore * 100).toFixed(0)}</span></div>
                        <div className="flex justify-between"><span>Performance:</span> <span>{(s.perfScore * 100).toFixed(0)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Warnings Banner (Fraud Alerts) */}
            {activeAlerts.length > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-500/10 p-5 space-y-3">
                <h4 className="font-bold text-sm text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  ⚠️ Enterprise Fraud Detection Watchlist Alert ({activeAlerts.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="rounded-lg border border-rose-200/50 bg-card p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-rose-700 dark:text-rose-400">
                            {alert.riskLevel} Risk Flag
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(alert.detectedAt), "dd MMM yyyy")}
                          </span>
                        </div>
                        <p className="text-foreground/90 leading-relaxed">{alert.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comparison Table */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {/* Criteria column */}
                      <th className="text-left px-5 py-4 font-semibold text-muted-foreground bg-muted/30 w-40">
                        Criteria
                      </th>
                      {/* Vendor columns */}
                      {scored.map((s, i) => {
                        const isLowest = s.quotation.price === lowestPrice;
                        const isBest = i === bestIdx;
                        const alerts = activeAlerts.filter((a) => a.vendorId === s.vendor?.id);

                        return (
                          <th
                            key={s.quotation.id}
                            className={`px-5 py-4 text-center font-semibold ${
                              isBest
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/10"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1.5">
                              <span>{s.vendor?.company}</span>
                              {alerts.length > 0 && (
                                <span className="rounded bg-rose-500/20 border border-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 dark:text-rose-400 animate-pulse">
                                  ⚠️ FLAGGED VENDOR
                                </span>
                              )}
                              {isBest && (
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-primary-foreground/90 uppercase tracking-wide">
                                  🏆 AI Recommended
                                </span>
                              )}
                              {isLowest && !isBest && (
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                                  💰 Lowest price
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Grand Total */}
                    <tr className="border-b">
                      <td className="px-5 py-3.5 font-medium bg-muted/20 text-muted-foreground">Grand Total</td>
                      {scored.map((s, i) => {
                        const isLowest = s.quotation.price === lowestPrice;
                        const isBest = i === bestIdx;
                        return (
                          <td key={s.quotation.id} className={`px-5 py-3.5 text-center font-bold text-base ${isBest ? "bg-primary/5 text-primary" : ""}`}>
                            {formatINR(s.quotation.price)}
                            {isLowest && <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">LOWEST</div>}
                          </td>
                        );
                      })}
                    </tr>
                    {/* GST % */}
                    <tr className="border-b">
                      <td className="px-5 py-3.5 font-medium bg-muted/20 text-muted-foreground">GST %</td>
                      {scored.map((s, i) => (
                        <td key={s.quotation.id} className={`px-5 py-3.5 text-center ${i === bestIdx ? "bg-primary/5" : ""}`}>
                          18%
                        </td>
                      ))}
                    </tr>
                    {/* Delivery */}
                    <tr className="border-b">
                      <td className="px-5 py-3.5 font-medium bg-muted/20 text-muted-foreground">Delivery (days)</td>
                      {scored.map((s, i) => {
                        const minDel = Math.min(...scored.map((x) => x.quotation.deliveryDays));
                        return (
                          <td key={s.quotation.id} className={`px-5 py-3.5 text-center ${i === bestIdx ? "bg-primary/5" : ""}`}>
                            <span className={s.quotation.deliveryDays === minDel ? "text-emerald-600 font-semibold" : ""}>
                              {s.quotation.deliveryDays} days
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                    {/* Vendor Rating */}
                    <tr className="border-b">
                      <td className="px-5 py-3.5 font-medium bg-muted/20 text-muted-foreground">Vendor Rating</td>
                      {scored.map((s, i) => (
                        <td key={s.quotation.id} className={`px-5 py-3.5 text-center ${i === bestIdx ? "bg-primary/5" : ""}`}>
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{s.vendor?.rating.toFixed(1)}/5</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    {/* Performance History Score */}
                    <tr className="border-b">
                      <td className="px-5 py-3.5 font-medium bg-muted/20 text-muted-foreground">ERP Scorecard</td>
                      {scored.map((s, i) => {
                        const scorePct = Math.round(s.perfScore * 100);
                        let scoreColor = "text-muted-foreground";
                        if (scorePct >= 90) scoreColor = "text-emerald-600 font-bold";
                        else if (scorePct >= 75) scoreColor = "text-foreground font-semibold";
                        else if (scorePct < 60) scoreColor = "text-rose-600 font-bold";

                        return (
                          <td key={s.quotation.id} className={`px-5 py-3.5 text-center ${i === bestIdx ? "bg-primary/5" : ""}`}>
                            <div className="flex flex-col items-center justify-center gap-0.5">
                              <span className={scoreColor}>{scorePct}%</span>
                              <span className="text-[10px] text-muted-foreground">Health rating</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    {/* Payment Terms (from notes) */}
                    <tr className="border-b">
                      <td className="px-5 py-3.5 font-medium bg-muted/20 text-muted-foreground">Payment Terms</td>
                      {scored.map((s, i) => (
                        <td key={s.quotation.id} className={`px-5 py-3.5 text-center text-xs text-muted-foreground ${i === bestIdx ? "bg-primary/5" : ""}`}>
                          {s.quotation.notes || "30 days"}
                        </td>
                      ))}
                    </tr>
                    {/* AI Score */}
                    <tr className="border-b">
                      <td className="px-5 py-3.5 font-medium bg-muted/20 text-muted-foreground">Overall Value Score</td>
                      {scored.map((s, i) => (
                        <td key={s.quotation.id} className={`px-5 py-3.5 text-center ${i === bestIdx ? "bg-primary/5" : ""}`}>
                          <div className="flex items-center justify-center gap-1.5">
                            <div className={`h-2 rounded-full ${i === bestIdx ? "bg-primary" : "bg-muted-foreground/30"}`}
                              style={{ width: `${(s.score * 100).toFixed(0)}%`, minWidth: 8, maxWidth: 48 }} />
                            <span className="font-bold text-sm">{(s.score * 100).toFixed(0)}/100</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    {/* Submitted */}
                    <tr>
                      <td className="px-5 py-3.5 font-medium bg-muted/20 text-muted-foreground">Submitted</td>
                      {scored.map((s, i) => (
                        <td key={s.quotation.id} className={`px-5 py-3.5 text-center text-xs text-muted-foreground ${i === bestIdx ? "bg-primary/5" : ""}`}>
                          {format(new Date(s.quotation.submittedAt), "dd MMM yyyy")}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                  {/* Action row */}
                  <tfoot>
                    <tr className="border-t bg-muted/10">
                      <td className="px-5 py-4 bg-muted/20" />
                      {scored.map((s, i) => {
                        const isBest = i === bestIdx;
                        const isAwarded = current.rfq.status === "Awarded";
                        const isSelected = s.quotation.status === "Selected";
                        const hasActiveAlert = activeAlerts.some((a) => a.vendorId === s.vendor?.id);

                        return (
                          <td key={s.quotation.id} className={`px-5 py-4 text-center ${isBest ? "bg-primary/5" : ""}`}>
                            {isSelected ? (
                              <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" /> Awarded
                              </div>
                            ) : isAwarded ? (
                              <span className="text-xs text-muted-foreground">Not selected</span>
                            ) : user?.role !== "Vendor" ? (
                              <Button
                                size="sm"
                                variant={isBest ? "default" : "outline"}
                                className={
                                  hasActiveAlert
                                    ? "bg-rose-600 hover:bg-rose-700 text-white border-transparent gap-1"
                                    : isBest
                                      ? "bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                                      : "gap-1"
                                }
                                onClick={() => award(s.quotation.id)}
                              >
                                {isSelected ? (
                                  <><CheckCircle2 className="h-3.5 w-3.5" /> Awarded</>
                                ) : hasActiveAlert ? (
                                  <><Info className="h-3.5 w-3.5" /> Award Anyway</>
                                ) : isBest ? (
                                  <><CheckCircle2 className="h-3.5 w-3.5" /> Select &amp; Approve</>
                                ) : (
                                  <><ChevronRight className="h-3.5 w-3.5" /> Select</>
                                )}
                              </Button>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Legend */}
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Awarding a vendor initiates the multi-level approval workflow automatically. Flagged vendors require high caution.
            </p>
          </>
        );
      })()}
    </div>
  );
}

// ─── Page Router ──────────────────────────────────────────────────────────────
function QuotationsPage() {
  const { user } = useStore();
  return user?.role === "Vendor" ? <VendorQuotationView /> : <BuyerQuotationView />;
}
