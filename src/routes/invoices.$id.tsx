import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatINR, useStore } from "@/lib/store";
import { ArrowLeft, Printer, Mail, CheckCircle2, Boxes } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";

export const Route = createFileRoute("/invoices/$id")({
  head: () => ({ meta: [{ title: "Invoice — VendorBridge" }] }),
  component: InvoiceDetail,
});

function InvoiceDetail() {
  const { id } = Route.useParams();
  const { invoices, vendors, pos, rfqs, markInvoiceSent, markInvoicePaid } = useStore();
  const inv = invoices.find((i) => i.id === id);
  const [emailOpen, setEmailOpen] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  if (!inv) return <div className="py-20 text-center text-muted-foreground">Invoice not found.</div>;
  const vendor = vendors.find((v) => v.id === inv.vendorId);
  const po = pos.find((p) => p.id === inv.poId);
  const rfq = rfqs.find((r) => r.id === po?.rfqId);

  const openEmail = () => {
    setTo(vendor?.email || ""); setSubject(`Invoice ${inv.code} from VendorBridge`);
    setBody(`Dear ${vendor?.contactPerson},\n\nPlease find attached invoice ${inv.code} for ${formatINR(inv.total)}.\nDue date: ${format(new Date(inv.dueDate), "dd MMM yyyy")}.\n\nRegards,\nVendorBridge`);
    setEmailOpen(true);
  };
  const sendEmail = () => {
    markInvoiceSent(inv.id);
    toast.success(`Invoice emailed to ${to}`);
    setEmailOpen(false);
  };

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm"><Link to="/invoices"><ArrowLeft className="mr-1 h-4 w-4" /> All invoices</Link></Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print / PDF</Button>
          <Button variant="outline" onClick={openEmail}><Mail className="mr-2 h-4 w-4" /> Send email</Button>
          {inv.status !== "Paid" && <Button onClick={() => { markInvoicePaid(inv.id); toast.success("Marked as paid"); }}><CheckCircle2 className="mr-2 h-4 w-4" /> Mark paid</Button>}
        </div>
      </div>

      <div className="print-container mx-auto max-w-4xl rounded-xl border bg-card p-8 shadow-[var(--shadow-card)] sm:p-12">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><Boxes className="h-6 w-6" /></div>
            <div>
              <div className="font-display text-xl font-semibold">VendorBridge</div>
              <div className="text-xs text-muted-foreground">Procurement & Vendor Management</div>
              <div className="text-xs text-muted-foreground">accounts@vendorbridge.io · +91 80000 00000</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Invoice</div>
            <div className="font-display text-2xl font-semibold">{inv.code}</div>
            <div className="mt-1"><StatusBadge status={inv.status} /></div>
          </div>
        </div>

        <div className="grid gap-6 py-6 sm:grid-cols-3">
          <Block label="Billed to">
            <div className="font-semibold">{vendor?.company}</div>
            <div className="text-sm text-muted-foreground">{vendor?.contactPerson}</div>
            <div className="text-sm text-muted-foreground">{vendor?.address}</div>
            <div className="text-sm text-muted-foreground">GST: {vendor?.gst}</div>
          </Block>
          <Block label="Reference">
            <div className="text-sm">PO: <span className="font-medium">{po?.code}</span></div>
            <div className="text-sm">RFQ: <span className="font-medium">{rfq?.code}</span></div>
          </Block>
          <Block label="Dates">
            <div className="text-sm">Issued: <span className="font-medium">{format(new Date(inv.createdAt), "dd MMM yyyy")}</span></div>
            <div className="text-sm">Due: <span className="font-medium">{format(new Date(inv.dueDate), "dd MMM yyyy")}</span></div>
          </Block>
        </div>

        <table className="w-full border-t text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-3">Description</th>
              <th className="py-3 text-right">Qty</th>
              <th className="py-3 text-right">Unit price</th>
              <th className="py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-3">
                <div className="font-medium">{rfq?.title || "Goods / services"}</div>
                <div className="text-xs text-muted-foreground">{rfq?.description}</div>
              </td>
              <td className="py-3 text-right">{rfq?.quantity ?? 1} {rfq?.unit ?? ""}</td>
              <td className="py-3 text-right">{formatINR(Math.round(inv.subtotal / (rfq?.quantity || 1)))}</td>
              <td className="py-3 text-right">{formatINR(inv.subtotal)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-6 flex flex-col items-end gap-1 text-sm">
          <Row k="Subtotal" v={formatINR(inv.subtotal)} />
          <Row k={`GST @ ${inv.taxRate}%`} v={formatINR(inv.tax)} />
          <div className="mt-2 flex w-72 items-center justify-between border-t pt-2 text-base">
            <span className="font-semibold">Grand total</span><span className="font-display text-xl font-semibold">{formatINR(inv.total)}</span>
          </div>
        </div>

        <div className="mt-10 grid gap-6 border-t pt-6 sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Notes</div>
            <p className="mt-1 text-sm">Payment is due within 30 days of invoice date. Please reference invoice number on remittance.</p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Authorised signatory</div>
            <div className="mt-6 font-display text-lg italic">VendorBridge</div>
            <div className="text-xs text-muted-foreground">Procurement Department</div>
          </div>
        </div>
      </div>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Email invoice {inv.code}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>To</Label><Input value={to} onChange={(e) => setTo(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Body</Label><Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} /></div>
            <p className="text-xs text-muted-foreground">Demo only — no email is actually sent. Invoice will be marked as Sent.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={sendEmail}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div><div className="mt-1">{children}</div></div>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex w-72 items-center justify-between"><span className="text-muted-foreground">{k}</span><span>{v}</span></div>;
}
