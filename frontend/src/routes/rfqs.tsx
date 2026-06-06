import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Paperclip, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/rfqs")({
  head: () => ({ meta: [{ title: "RFQs — VendorBridge" }] }),
  component: RFQsPage,
});

function RFQsPage() {
  const { rfqs, vendors, addRFQ, deleteRFQ, user, quotations } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("units");
  const [deadline, setDeadline] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [selected, setSelected] = useState<string[]>([]);
  const [attachment, setAttachment] = useState<{ name: string; size: number } | null>(null);

  const visibleRFQs = useMemo(() => {
    let list = rfqs;
    if (user?.role === "Vendor" && user.vendorId) list = list.filter((r) => r.assignedVendorIds.includes(user.vendorId!));
    return list
      .filter((r) => (q ? `${r.code} ${r.title}`.toLowerCase().includes(q.toLowerCase()) : true))
      .filter((r) => (status === "all" || r.status === status));
  }, [rfqs, q, status, user]);

  const reset = () => {
    setTitle(""); setDescription(""); setQuantity(1); setUnit("units");
    setDeadline(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
    setSelected([]); setAttachment(null);
  };

  const save = () => {
    if (!title || !selected.length) { toast.error("Title and at least one vendor required"); return; }
    addRFQ({
      title, description, quantity, unit,
      deadline: new Date(deadline).toISOString(),
      status: "Open", assignedVendorIds: selected,
      attachments: attachment ? [attachment] : [],
    });
    toast.success("RFQ created and vendors notified");
    setOpen(false); reset();
  };

  const canCreate = user?.role !== "Vendor";

  const { location } = useRouterState();
  const isDetailView = /^\/rfqs\/.+/.test(location.pathname);

  if (isDetailView) return <Outlet />;

  return (
    <div>
      <PageHeader
        title="Requests for Quotation"
        description="Create RFQs, assign vendors, collect quotations."
        actions={canCreate ? <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> New RFQ</Button> : undefined}
      />

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Input placeholder="Search RFQs…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {["Draft", "Open", "Closed", "Awarded"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Vendors</TableHead>
                  <TableHead>Quotes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRFQs.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer">
                    <TableCell className="font-medium">{r.code}</TableCell>
                    <TableCell>
                      <div className="max-w-md truncate">{r.title}</div>
                      <div className="text-xs text-muted-foreground">{r.quantity} {r.unit}</div>
                    </TableCell>
                    <TableCell>{format(new Date(r.deadline), "dd MMM yyyy")}</TableCell>
                    <TableCell>{r.assignedVendorIds.length}</TableCell>
                    <TableCell>{quotations.filter((qq) => qq.rfqId === r.id).length}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm"><Link to="/rfqs/$id" params={{ id: r.id }}>Open <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
                      {canCreate && (
                        <Button size="icon" variant="ghost" onClick={() => { deleteRFQ(r.id); toast.success("RFQ deleted"); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {visibleRFQs.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No RFQs yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[900px] bg-card p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-muted/30 px-6 py-4 border-b">
            <DialogTitle className="text-xl font-bold">Create RFQ's</DialogTitle>
            <p className="text-sm text-muted-foreground mt-0.5">new request for quotation</p>
            
            {/* Steps Indicator */}
            <div className="mt-6 mb-2 flex items-center justify-between relative max-w-[600px]">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-border -z-10" />
              {[1, 2, 3].map((step) => (
                <div 
                  key={step} 
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold border-2 bg-card
                    ${step === 1 ? "border-primary text-primary" : "border-muted-foreground/30 text-muted-foreground"}`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ── LEFT COLUMN ── */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>RFQ's title*</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Office Furniture procurement Q2" />
                </div>
                
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input placeholder="Furniture" />
                </div>
                
                <div className="space-y-1.5">
                  <Label>Deadline*</Label>
                  <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
                
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ergonomic chairs and standing desks for 3rd floor" className="resize-none" />
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <Button onClick={save} className="w-full sm:w-auto">Save & Send to Vendors</Button>
                  <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">Save as Draft</Button>
                </div>
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="space-y-6">
                
                {/* Line Items */}
                <div className="space-y-2">
                  <Label>Line items</Label>
                  <div className="rounded-lg border bg-card overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="h-8 py-1">Item</TableHead>
                          <TableHead className="h-8 py-1 text-center">qty</TableHead>
                          <TableHead className="h-8 py-1 text-center">Unit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="py-2">Ergonomic chair</TableCell>
                          <TableCell className="py-2 text-center">25</TableCell>
                          <TableCell className="py-2 text-center">NOS</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-2">Standing desks</TableCell>
                          <TableCell className="py-2 text-center">10</TableCell>
                          <TableCell className="py-2 text-center">NOS</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div className="p-2 border-t bg-muted/10">
                      <Button variant="outline" size="sm" className="h-7 text-xs">+ add line item</Button>
                    </div>
                  </div>
                </div>

                {/* Assign Vendors */}
                <div className="space-y-2">
                  <Label className="uppercase text-xs tracking-wider text-muted-foreground">ASSIGN VENDORS</Label>
                  <div className="rounded-lg border bg-card overflow-hidden">
                    <div className="p-2 space-y-1 max-h-32 overflow-y-auto">
                      {vendors.filter(v => v.status === "Active").slice(0, 2).map((v) => (
                        <div key={v.id} className="flex items-center justify-between text-sm px-2 py-1.5 rounded-md hover:bg-muted">
                          <span>{v.company}</span>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground cursor-pointer hover:text-destructive" />
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t bg-muted/10">
                      <Button variant="outline" size="sm" className="h-7 text-xs">+ add vendor</Button>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <Label>Attachments</Label>
                  <label className="flex flex-col items-center justify-center cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
                    <Paperclip className="h-5 w-5 mb-2 opacity-50" />
                    {attachment ? `${attachment.name} · ${(attachment.size / 1024).toFixed(0)} KB` : "Drag & drop files or click to upload"}
                    <input type="file" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0]; if (f) setAttachment({ name: f.name, size: f.size });
                    }} />
                  </label>
                </div>

              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
