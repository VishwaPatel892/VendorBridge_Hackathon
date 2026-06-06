import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { formatINR, recommendVendor, useStore } from "@/lib/store";
import { ArrowLeft, Sparkles, Trophy, Star, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/rfqs/$id")({
  head: () => ({ meta: [{ title: "RFQ — VendorBridge" }] }),
  component: RFQDetail,
});

function RFQDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { rfqs, vendors, quotations, user, submitQuotation, createPOFromQuotation } = useStore();
  const rfq = rfqs.find((r) => r.id === id);
  if (!rfq) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">RFQ not found.</p>
        <Button asChild className="mt-4"><Link to="/rfqs">Back to RFQs</Link></Button>
      </div>
    );
  }

  const rfqQuotes = quotations.filter((q) => q.rfqId === rfq.id);
  const scored = recommendVendor(rfqQuotes, vendors) || [];
  const best = scored[0];

  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(0);
  const [delivery, setDelivery] = useState(7);
  const [notes, setNotes] = useState("");

  const isAssignedVendor = user?.role === "Vendor" && user.vendorId && rfq.assignedVendorIds.includes(user.vendorId);
  const alreadyQuoted = isAssignedVendor && rfqQuotes.some((q) => q.vendorId === user.vendorId);

  const onSubmitQuote = () => {
    if (!user?.vendorId) return;
    if (price <= 0) { toast.error("Enter a valid price"); return; }
    submitQuotation({ rfqId: rfq.id, vendorId: user.vendorId, price, deliveryDays: delivery, notes });
    toast.success("Quotation submitted");
    setOpen(false);
  };

  const award = (quotationId: string) => {
    const po = createPOFromQuotation(quotationId);
    if (po) { toast.success(`${po.code} created and sent for approval`); navigate({ to: "/purchase-orders" }); }
  };

  return (
    <div>
      <div className="mb-2">
        <Button asChild variant="ghost" size="sm"><Link to="/rfqs"><ArrowLeft className="mr-1 h-4 w-4" /> All RFQs</Link></Button>
      </div>
      <PageHeader
        title={`${rfq.code} · ${rfq.title}`}
        description={rfq.description}
        actions={
          isAssignedVendor && !alreadyQuoted ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button>Submit quotation</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Submit quotation for {rfq.code}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5"><Label>Total price (INR)</Label><Input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} /></div>
                  <div className="space-y-1.5"><Label>Delivery (days)</Label><Input type="number" value={delivery} onChange={(e) => setDelivery(parseInt(e.target.value) || 0)} /></div>
                  <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={onSubmitQuote}>Submit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row k="Status" v={<StatusBadge status={rfq.status} />} />
            <Row k="Quantity" v={`${rfq.quantity} ${rfq.unit}`} />
            <Row k="Deadline" v={format(new Date(rfq.deadline), "dd MMM yyyy")} />
            <Row k="Created" v={format(new Date(rfq.createdAt), "dd MMM yyyy")} />
            <Row k="Vendors invited" v={rfq.assignedVendorIds.length} />
            <Row k="Quotations" v={rfqQuotes.length} />
            {rfq.attachments.length > 0 && (
              <div>
                <div className="text-muted-foreground">Attachments</div>
                {rfq.attachments.map((a) => <div key={a.name} className="mt-1 rounded border px-2 py-1 text-xs">{a.name}</div>)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quotation comparison</span>
              {best && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> AI pick: {best.vendor?.company}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {scored.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">No quotations submitted yet.</div>
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
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scored.map((s, i) => {
                      const isLowest = s.quotation.price === Math.min(...scored.map((x) => x.quotation.price));
                      return (
                        <TableRow key={s.quotation.id} className={i === 0 ? "bg-primary/5" : ""}>
                          <TableCell>
                            <div className="flex items-center gap-2 font-medium">
                              {i === 0 && <Trophy className="h-4 w-4 text-primary" />}
                              {s.vendor?.company}
                            </div>
                            <div className="text-xs text-muted-foreground">{s.quotation.notes || "—"}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">{formatINR(s.quotation.price)}</div>
                            {isLowest && <div className="text-[10px] font-medium text-success">LOWEST</div>}
                          </TableCell>
                          <TableCell>{s.quotation.deliveryDays} days</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                              {s.vendor?.rating.toFixed(1)}
                            </div>
                          </TableCell>
                          <TableCell><span className="font-medium">{(s.score * 100).toFixed(0)}</span><span className="text-muted-foreground">/100</span></TableCell>
                          <TableCell className="text-right">
                            {user?.role !== "Vendor" && rfq.status !== "Awarded" && (
                              <Button size="sm" onClick={() => award(s.quotation.id)}>Award <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex items-center justify-between"><span className="text-muted-foreground">{k}</span><span>{v}</span></div>;
}
