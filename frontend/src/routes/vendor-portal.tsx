import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, formatINR } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2, FileText, Quote, ShoppingCart, Receipt, UserCircle2,
  CheckCircle2, Clock, Send, Star, Phone, Mail, MapPin,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vendor-portal")({
  component: VendorPortalPage,
});

function VendorPortalPage() {
  const { user, vendors, rfqs, quotations, pos, invoices, submitQuotation, updateVendor } = useStore();
  const vendorId = user?.vendorId;
  const vendor = vendors.find((v) => v.id === vendorId);

  if (!vendorId || !vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Building2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold">Vendor Portal</h2>
        <p className="text-muted-foreground mt-2">
          This portal is only accessible to vendor accounts.<br />
          Please log in with a vendor account to continue.
        </p>
      </div>
    );
  }

  const myRFQs = rfqs.filter((r) => r.assignedVendorIds.includes(vendorId) && r.status !== "Draft");
  const myQuotations = quotations.filter((q) => q.vendorId === vendorId);
  const myPOs = pos.filter((p) => p.vendorId === vendorId);
  const myInvoices = invoices.filter((i) => i.vendorId === vendorId);
  const myQuotedRFQIds = new Set(myQuotations.map((q) => q.rfqId));

  const [quoteForm, setQuoteForm] = useState({ rfqId: "", price: "", deliveryDays: "", notes: "" });
  const [profileForm, setProfileForm] = useState({ phone: vendor.phone, address: vendor.address, contactPerson: vendor.contactPerson });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Vendor Portal — ${vendor.company}`}
        description="Manage your RFQs, quotations, orders, and invoices from one place."
      >
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="font-semibold">{vendor.rating}</span>
          <Badge className={`text-[10px] border ${vendor.status === "Active" ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground border-border"}`}>
            {vendor.status}
          </Badge>
        </div>
      </PageHeader>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Open RFQs", value: myRFQs.filter((r) => r.status === "Open").length, icon: FileText, color: "text-primary" },
          { label: "My Quotations", value: myQuotations.length, icon: Quote, color: "text-primary" },
          { label: "Purchase Orders", value: myPOs.length, icon: ShoppingCart, color: "text-success" },
          { label: "Invoices", value: myInvoices.length, icon: Receipt, color: "text-warning" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 bg-muted ${color}`}><Icon className="h-4 w-4" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-xl font-bold">{value}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="rfqs">
        <TabsList>
          <TabsTrigger value="rfqs" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> RFQs</TabsTrigger>
          <TabsTrigger value="quotations" className="gap-1.5"><Quote className="h-3.5 w-3.5" /> Quotations</TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5"><ShoppingCart className="h-3.5 w-3.5" /> Orders</TabsTrigger>
          <TabsTrigger value="invoices" className="gap-1.5"><Receipt className="h-3.5 w-3.5" /> Invoices</TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5"><UserCircle2 className="h-3.5 w-3.5" /> Profile</TabsTrigger>
        </TabsList>

        {/* RFQs Tab */}
        <TabsContent value="rfqs" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Assigned RFQs</h3>
            {/* Submit Quotation Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Send className="h-4 w-4" /> Submit Quotation</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Submit a Quotation</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label>Select RFQ *</Label>
                    <Select value={quoteForm.rfqId} onValueChange={(v) => setQuoteForm((f) => ({ ...f, rfqId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select RFQ" /></SelectTrigger>
                      <SelectContent>
                        {myRFQs.filter((r) => r.status === "Open" && !myQuotedRFQIds.has(r.id)).map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.code} — {r.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Price (₹) *</Label>
                      <Input type="number" placeholder="e.g. 250000" value={quoteForm.price} onChange={(e) => setQuoteForm((f) => ({ ...f, price: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Delivery Days *</Label>
                      <Input type="number" placeholder="e.g. 14" value={quoteForm.deliveryDays} onChange={(e) => setQuoteForm((f) => ({ ...f, deliveryDays: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Notes</Label>
                    <Textarea placeholder="Warranty, terms, special conditions..." rows={3} value={quoteForm.notes} onChange={(e) => setQuoteForm((f) => ({ ...f, notes: e.target.value }))} />
                  </div>
                  <Button className="w-full" onClick={() => {
                    if (!quoteForm.rfqId || !quoteForm.price || !quoteForm.deliveryDays) { toast.error("Fill in all required fields"); return; }
                    submitQuotation({ rfqId: quoteForm.rfqId, vendorId, price: Number(quoteForm.price), deliveryDays: Number(quoteForm.deliveryDays), notes: quoteForm.notes });
                    toast.success("Quotation submitted successfully");
                    setQuoteForm({ rfqId: "", price: "", deliveryDays: "", notes: "" });
                  }}>Submit Quotation</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {myRFQs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No RFQs assigned to you yet.</div>
          ) : (
            <div className="space-y-3">
              {myRFQs.map((rfq) => {
                const hasQuoted = myQuotedRFQIds.has(rfq.id);
                return (
                  <Card key={rfq.id} className={`hover:shadow-sm transition-all ${hasQuoted ? "opacity-70" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-muted-foreground">{rfq.code}</span>
                            <Badge className={`text-[10px] border ${rfq.status === "Open" ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground border-border"}`}>
                              {rfq.status}
                            </Badge>
                            {hasQuoted && <Badge className="text-[10px] border bg-primary/15 text-primary border-primary/30">Quoted</Badge>}
                          </div>
                          <h4 className="font-semibold mt-1 text-sm">{rfq.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{rfq.description}</p>
                        </div>
                        <div className="text-right shrink-0 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(rfq.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Quotations Tab */}
        <TabsContent value="quotations" className="mt-4 space-y-3">
          {myQuotations.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No quotations submitted yet.</div>
          ) : (
            <div className="space-y-3">
              {myQuotations.map((q) => {
                const rfq = rfqs.find((r) => r.id === q.rfqId);
                return (
                  <Card key={q.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground">{rfq?.code} — {rfq?.title}</div>
                          <div className="font-bold text-primary mt-1">{formatINR(q.price)}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">Delivery: {q.deliveryDays} days</div>
                        </div>
                        <Badge className={`text-[10px] border ${q.status === "Selected" ? "bg-success/15 text-success border-success/30" : q.status === "Rejected" ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-muted text-muted-foreground border-border"}`}>
                          {q.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="orders" className="mt-4 space-y-3">
          {myPOs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No purchase orders yet.</div>
          ) : (
            <div className="space-y-3">
              {myPOs.map((po) => (
                <Card key={po.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-mono text-sm font-semibold">{po.code}</div>
                        <div className="text-primary font-bold mt-1">{formatINR(po.totalAmount)}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{new Date(po.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                      <Badge className={`text-[10px] border ${po.status === "Fulfilled" ? "bg-success/15 text-success border-success/30" : po.status === "Cancelled" ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-primary/15 text-primary border-primary/30"}`}>
                        {po.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-4 space-y-3">
          {myInvoices.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No invoices yet.</div>
          ) : (
            <div className="space-y-3">
              {myInvoices.map((inv) => (
                <Card key={inv.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-mono text-sm font-semibold">{inv.code}</div>
                        <div className="text-primary font-bold mt-1">{formatINR(inv.total)}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Due: {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                      <Badge className={`text-[10px] border ${inv.status === "Paid" ? "bg-success/15 text-success border-success/30" : inv.status === "Sent" ? "bg-primary/15 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"}`}>
                        {inv.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Company Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</Label>
                  <Input value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><UserCircle2 className="h-3.5 w-3.5" /> Contact Person</Label>
                  <Input value={profileForm.contactPerson} onChange={(e) => setProfileForm((f) => ({ ...f, contactPerson: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Address</Label>
                  <Input value={profileForm.address} onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</Label>
                  <Input value={vendor.email} disabled className="opacity-70" />
                </div>
                <div className="space-y-1.5">
                  <Label>GST Number</Label>
                  <Input value={vendor.gst} disabled className="opacity-70 font-mono" />
                </div>
              </div>
              <Button onClick={() => {
                updateVendor(vendorId, profileForm);
                toast.success("Profile updated successfully");
              }}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
