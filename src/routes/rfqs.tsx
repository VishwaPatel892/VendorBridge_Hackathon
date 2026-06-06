import { createFileRoute, Link } from "@tanstack/react-router";
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
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New RFQ</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Laptops for engineering team" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} /></div>
            <div className="space-y-1.5"><Label>Unit</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Deadline</Label><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Assign vendors</Label>
              <div className="max-h-44 space-y-1 overflow-auto rounded-md border p-2">
                {vendors.filter((v) => v.status === "Active").map((v) => (
                  <label key={v.id} className="flex items-center gap-2 rounded p-1.5 hover:bg-muted">
                    <Checkbox
                      checked={selected.includes(v.id)}
                      onCheckedChange={(c) => setSelected((prev) => c ? [...prev, v.id] : prev.filter((x) => x !== v.id))}
                    />
                    <span className="text-sm">{v.company} <span className="text-muted-foreground">· {v.category}</span></span>
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Attachment (optional)</Label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground hover:bg-muted">
                <Paperclip className="h-4 w-4" />
                {attachment ? `${attachment.name} · ${(attachment.size / 1024).toFixed(0)} KB` : "Click to attach a file"}
                <input type="file" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0]; if (f) setAttachment({ name: f.name, size: f.size });
                }} />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Create RFQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
