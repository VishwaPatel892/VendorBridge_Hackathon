import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";
import { formatINR, recommendVendor, useStore } from "@/lib/store";
import {
  ArrowLeft, Paperclip, Plus, Trash2, Send, Save,
  Sparkles, Trophy, Star, ChevronRight, X, Upload,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/rfqs/$id")({
  head: () => ({ meta: [{ title: "RFQ — VendorBridge" }] }),
  component: RFQDetail,
});

const STEPS = ["RFQ Details", "Line Items & Vendors", "Quotations"];

function RFQDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { rfqs, vendors, quotations, user, submitQuotation, createPOFromQuotation, sendRFQToVendors, saveRFQAsDraft, vendorPerformance, fraudAlerts } = useStore();
  const rfq = rfqs.find((r) => r.id === id);

  const [activeStep, setActiveStep] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [price, setPrice] = useState(0);
  const [delivery, setDelivery] = useState(7);
  const [notes, setNotes] = useState("");

  if (!rfq) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-muted-foreground text-lg">RFQ not found.</p>
        <Button asChild><Link to="/rfqs">Back to RFQs</Link></Button>
      </div>
    );
  }

  const rfqQuotes = quotations.filter((q) => q.rfqId === rfq.id);
  const scored = recommendVendor(rfqQuotes, vendors, vendorPerformance) || [];
  const best = scored[0];
  const isAssignedVendor = user?.role === "Vendor" && user.vendorId && rfq.assignedVendorIds.includes(user.vendorId);
  const alreadyQuoted = isAssignedVendor && rfqQuotes.some((q) => q.vendorId === user.vendorId);
  const canCreate = user?.role !== "Vendor";

  const onSubmitQuote = () => {
    if (!user?.vendorId) return;
    if (price <= 0) { toast.error("Enter a valid price"); return; }
    submitQuotation({ rfqId: rfq.id, vendorId: user.vendorId, price, deliveryDays: delivery, notes });
    toast.success("Quotation submitted");
    setQuoteOpen(false);
  };

  const award = (quotationId: string) => {
    const po = createPOFromQuotation(quotationId);
    if (po) {
      toast.success(`${po.code} created and sent for approval`);
      navigate({ to: "/purchase-orders" });
    }
  };

  const assignedVendors = vendors.filter((v) => rfq.assignedVendorIds.includes(v.id));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link to="/rfqs"><ArrowLeft className="h-4 w-4" /> All RFQs</Link>
        </Button>
        <div className="h-4 w-px bg-border" />
        <span className="text-sm text-muted-foreground font-mono">{rfq.code}</span>
        <StatusBadge status={rfq.status} />
        <div className="ml-auto flex items-center gap-2">
          {isAssignedVendor && !alreadyQuoted && (
            <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
              <DialogTrigger asChild><Button size="sm"><Send className="mr-1.5 h-3.5 w-3.5" />Submit Quotation</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Submit quotation for {rfq.code}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5"><Label>Total price (INR)</Label><Input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} /></div>
                  <div className="space-y-1.5"><Label>Delivery (days)</Label><Input type="number" value={delivery} onChange={(e) => setDelivery(parseInt(e.target.value) || 0)} /></div>
                  <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setQuoteOpen(false)}>Cancel</Button>
                  <Button onClick={onSubmitQuote}>Submit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{rfq.title}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Request for Quotation — Review all details below</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => setActiveStep(i)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                ${activeStep === i
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border-2 transition-all
                ${activeStep === i ? "border-primary-foreground/50 bg-primary-foreground/20" : "border-current"}`}>
                {i + 1}
              </span>
              {step}
            </button>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-border mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1: RFQ Details ── */}
      {activeStep === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="font-semibold text-base">RFQ Information</h2>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">RFQ Title</Label>
              <div className="rounded-md border bg-muted/30 px-3 py-2.5 text-sm font-medium">{rfq.title}</div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Category</Label>
              <div className="rounded-md border bg-muted/30 px-3 py-2.5 text-sm">{rfq.category || "—"}</div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Deadline</Label>
              <div className="rounded-md border bg-muted/30 px-3 py-2.5 text-sm">
                {format(new Date(rfq.deadline), "dd MMMM yyyy")}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Description</Label>
              <div className="rounded-md border bg-muted/30 px-3 py-2.5 text-sm min-h-[80px] whitespace-pre-wrap leading-relaxed">
                {rfq.description || "—"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Quantity</Label>
                <div className="rounded-md border bg-muted/30 px-3 py-2.5 text-sm">{rfq.quantity} {rfq.unit}</div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Created</Label>
                <div className="rounded-md border bg-muted/30 px-3 py-2.5 text-sm">
                  {format(new Date(rfq.createdAt), "dd MMM yyyy")}
                </div>
              </div>
            </div>
          </div>

          {/* Right column — Line Items */}
          <div className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="font-semibold text-base">Line Items</h2>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Item</th>
                    <th className="text-center px-3 py-2.5 font-medium text-muted-foreground w-20">Qty</th>
                    <th className="text-center px-3 py-2.5 font-medium text-muted-foreground w-20">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {(rfq.lineItems || []).map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? "" : "bg-muted/20"}>
                      <td className="px-3 py-2.5 font-medium">{item.name}</td>
                      <td className="px-3 py-2.5 text-center">{item.qty}</td>
                      <td className="px-3 py-2.5 text-center text-muted-foreground">{item.unit}</td>
                    </tr>
                  ))}
                  {(!rfq.lineItems || rfq.lineItems.length === 0) && (
                    <tr><td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">No line items.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Assigned Vendors */}
            <div className="space-y-3">
              <h2 className="font-semibold text-base">Assigned Vendors</h2>
              <div className="space-y-2">
                {assignedVendors.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium">{v.company}</p>
                      <p className="text-xs text-muted-foreground">{v.category} · {v.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {v.rating.toFixed(1)}
                    </div>
                  </div>
                ))}
                {assignedVendors.length === 0 && (
                  <p className="text-sm text-muted-foreground">No vendors assigned.</p>
                )}
              </div>
            </div>

            {/* Attachments */}
            {rfq.attachments.length > 0 && (
              <div className="space-y-2">
                <h2 className="font-semibold text-base">Attachments</h2>
                <div className="space-y-2">
                  {rfq.attachments.map((a) => (
                    <div key={a.name} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1">{a.name}</span>
                      <span className="text-xs text-muted-foreground">{(a.size / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rfq.attachments.length === 0 && (
              <div className="space-y-2">
                <h2 className="font-semibold text-base">Attachments</h2>
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 text-center">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag & drop files or click to upload</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: Line Items & Vendors full view ── */}
      {activeStep === 1 && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-base">Line Items</h2>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Item Name</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Qty</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {(rfq.lineItems || []).map((item, idx) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-center">{item.qty}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-base">Assigned Vendors ({assignedVendors.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assignedVendors.map((v) => (
                <div key={v.id} className="flex items-start gap-3 rounded-lg border bg-muted/10 px-4 py-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {v.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{v.company}</p>
                    <p className="text-xs text-muted-foreground">{v.category}</p>
                    <p className="text-xs text-muted-foreground truncate">{v.email}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {v.rating.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Quotations ── */}
      {activeStep === 2 && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-semibold text-base">Quotation Comparison</h2>
            {best && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI Recommendation: {best.vendor?.company}
              </span>
            )}
          </div>
          {scored.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-sm">No quotations submitted yet.</p>
              {isAssignedVendor && !alreadyQuoted && (
                <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-4" size="sm"><Send className="mr-1.5 h-3.5 w-3.5" />Submit Quotation</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Submit quotation for {rfq.code}</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-1.5"><Label>Total price (INR)</Label><Input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} /></div>
                      <div className="space-y-1.5"><Label>Delivery (days)</Label><Input type="number" value={delivery} onChange={(e) => setDelivery(parseInt(e.target.value) || 0)} /></div>
                      <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setQuoteOpen(false)}>Cancel</Button>
                      <Button onClick={onSubmitQuote}>Submit</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scored.map((s, i) => {
                    const isLowest = s.quotation.price === Math.min(...scored.map((x) => x.quotation.price));
                    const isFlagged = fraudAlerts.some((a) => !a.dismissed && a.vendorId === s.vendor?.id);
                    return (
                      <TableRow key={s.quotation.id} className={i === 0 ? "bg-primary/5" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2 font-medium">
                            {i === 0 && <Trophy className="h-4 w-4 text-primary" />}
                            {s.vendor?.company}
                            {isFlagged && (
                              <span className="rounded bg-rose-500/20 border border-rose-500/30 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 dark:text-rose-400 animate-pulse">
                                ⚠️ FLAGGED
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{s.quotation.notes || "—"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{formatINR(s.quotation.price)}</div>
                          {isLowest && <div className="text-[10px] font-medium text-green-600 dark:text-green-400">LOWEST</div>}
                        </TableCell>
                        <TableCell>{s.quotation.deliveryDays} days</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            {s.vendor?.rating.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{(s.score * 100).toFixed(0)}</span>
                          <span className="text-muted-foreground">/100</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {canCreate && rfq.status !== "Awarded" && (
                            <Button 
                              size="sm" 
                              variant={isFlagged ? "destructive" : "default"}
                              onClick={() => award(s.quotation.id)}
                            >
                              Award <ChevronRight className="ml-1 h-3.5 w-3.5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex gap-2">
          {activeStep > 0 && (
            <Button variant="outline" onClick={() => setActiveStep(activeStep - 1)}>
              ← Previous
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {canCreate && rfq.status !== "Awarded" && rfq.status !== "Closed" && (
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => {
                saveRFQAsDraft(rfq.id);
                toast.info(`${rfq.code} saved as Draft`);
              }}
            >
              <Save className="h-4 w-4" /> Save as Draft
            </Button>
          )}
          {activeStep < STEPS.length - 1 ? (
            <Button onClick={() => setActiveStep(activeStep + 1)} className="gap-1.5">
              Next Step <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            canCreate && rfq.status !== "Awarded" && rfq.status !== "Closed" && (
              <Button
                className="gap-1.5"
                disabled={isSending || rfq.assignedVendorIds.length === 0}
                onClick={() => {
                  setIsSending(true);
                  sendRFQToVendors(rfq.id);
                  toast.success(
                    `${rfq.code} sent to ${rfq.assignedVendorIds.length} vendor(s)! They have been notified.`,
                    { duration: 4000 }
                  );
                  setTimeout(() => setIsSending(false), 1500);
                }}
              >
                <Send className="h-4 w-4" />
                {isSending ? "Sending…" : "Send to Vendors"}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
