import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Star, Search } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import type { Vendor } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/vendors")({
  head: () => ({ meta: [{ title: "Vendors — VendorBridge" }] }),
  component: VendorsPage,
});

const empty: Omit<Vendor, "id" | "createdAt"> = {
  company: "", gst: "", email: "", phone: "", address: "",
  contactPerson: "", category: "Industrial", status: "Active", rating: 4,
};

function VendorsPage() {
  const { vendors, addVendor, updateVendor, deleteVendor } = useStore();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState(empty);

  const filtered = useMemo(() => {
    return vendors.filter((v) =>
      (q ? `${v.company} ${v.email} ${v.contactPerson}`.toLowerCase().includes(q.toLowerCase()) : true) &&
      (category === "all" || v.category === category) &&
      (status === "all" || v.status === status)
    );
  }, [vendors, q, category, status]);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (v: Vendor) => {
    setEditing(v);
    setForm({ company: v.company, gst: v.gst, email: v.email, phone: v.phone, address: v.address, contactPerson: v.contactPerson, category: v.category, status: v.status, rating: v.rating });
    setOpen(true);
  };

  const save = () => {
    if (!form.company || !form.email) { toast.error("Company and email required"); return; }
    if (editing) { updateVendor(editing.id, form); toast.success("Vendor updated"); }
    else { addVendor(form); toast.success("Vendor created"); }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Vendors"
        description="Onboard, rate and govern your supplier network."
        actions={<Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New vendor</Button>}
      />

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search vendors…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {["Industrial", "Office", "Electronics", "Construction", "Logistics"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {["Active", "Inactive", "Blacklisted"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="font-medium">{v.company}</div>
                      <div className="text-xs text-muted-foreground">{v.gst}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{v.contactPerson}</div>
                      <div className="text-xs text-muted-foreground">{v.email}</div>
                    </TableCell>
                    <TableCell>{v.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="text-sm">{v.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={v.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { deleteVendor(v.id); toast.success("Vendor deleted"); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No vendors match your filters.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit vendor" : "New vendor"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Company name"><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
            <Field label="GST number"><Input value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Contact person"><Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></Field>
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Industrial", "Office", "Electronics", "Construction", "Logistics", "Services"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Vendor["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Active", "Inactive", "Blacklisted"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Rating (0–5)"><Input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} /></Field>
            <div className="sm:col-span-2"><Field label="Address"><Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Create vendor"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
