import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, formatINR } from "@/lib/store";
import type { Contract, ContractStatus } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, Plus, Clock, CheckCircle2, XCircle, RefreshCw,
  AlertTriangle, Building2, CalendarDays, DollarSign, History,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contracts")({
  component: ContractsPage,
});

function statusColor(s: ContractStatus) {
  return {
    Active: "bg-success/15 text-success border-success/30",
    Expired: "bg-muted text-muted-foreground border-border",
    Terminated: "bg-destructive/15 text-destructive border-destructive/30",
    Renewed: "bg-primary/15 text-primary border-primary/30",
  }[s];
}

function statusIcon(s: ContractStatus) {
  return {
    Active: <CheckCircle2 className="h-3.5 w-3.5" />,
    Expired: <Clock className="h-3.5 w-3.5" />,
    Terminated: <XCircle className="h-3.5 w-3.5" />,
    Renewed: <RefreshCw className="h-3.5 w-3.5" />,
  }[s];
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function ContractCard({ contract }: { contract: Contract }) {
  const { vendors, terminateContract, renewContract, user } = useStore();
  const vendor = vendors.find((v) => v.id === contract.vendorId);
  const days = daysUntil(contract.endDate);
  const isExpiringSoon = days > 0 && days <= 60 && contract.status === "Active";
  const [renewDate, setRenewDate] = useState("");

  return (
    <Card className={`transition-all hover:shadow-md ${contract.renewalAlert ? "ring-1 ring-warning/50" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">{contract.code}</span>
              <Badge className={`text-[10px] border ${statusColor(contract.status)} flex items-center gap-1`}>
                {statusIcon(contract.status)} {contract.status}
              </Badge>
              {contract.renewalAlert && (
                <Badge className="text-[10px] border bg-warning/15 text-warning border-warning/30 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Renewal Alert
                </Badge>
              )}
            </div>
            <h3 className="mt-1 font-semibold text-sm leading-tight">{contract.title}</h3>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-primary">{formatINR(contract.value)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{vendor?.company ?? "—"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span>
              {new Date(contract.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              {isExpiringSoon && <span className="ml-1 text-warning font-medium">({days}d left)</span>}
              {days <= 0 && contract.status === "Active" && <span className="ml-1 text-destructive font-medium">(Expired)</span>}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span>{contract.documents.length} document(s)</span>
          </div>
        </div>

        {contract.notes && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">{contract.notes}</p>
        )}

        {/* History */}
        {contract.history.length > 0 && (
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
              <History className="h-3 w-3" /> History
            </div>
            <div className="space-y-1">
              {contract.history.slice(-2).map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span className="text-foreground">{h.action}</span>
                  <span className="text-muted-foreground ml-auto">{new Date(h.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {(contract.status === "Active" || contract.status === "Renewed") && user?.role !== "Vendor" && (
          <div className="flex gap-2 pt-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs">
                  <RefreshCw className="h-3 w-3" /> Renew
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Renew Contract</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <Label>New End Date</Label>
                  <Input type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)} />
                  <Button className="w-full" onClick={() => {
                    if (!renewDate) { toast.error("Select a new end date"); return; }
                    renewContract(contract.id, new Date(renewDate).toISOString(), user?.name || "Officer");
                    toast.success(`${contract.code} renewed successfully`);
                  }}>Confirm Renewal</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs text-destructive hover:text-destructive"
              onClick={() => {
                terminateContract(contract.id, user?.name || "Officer", "Manual termination");
                toast.success(`${contract.code} terminated`);
              }}>
              <XCircle className="h-3 w-3" /> Terminate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NewContractDialog() {
  const { vendors, pos, addContract, user } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    vendorId: "", poId: "", title: "", startDate: "", endDate: "", value: "", notes: "",
  });

  function handleSubmit() {
    if (!form.vendorId || !form.title || !form.startDate || !form.endDate || !form.value) {
      toast.error("Fill in all required fields"); return;
    }
    addContract({
      vendorId: form.vendorId, poId: form.poId || undefined, title: form.title,
      startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(),
      value: Number(form.value), status: "Active", renewalAlert: false, documents: [],
      notes: form.notes, createdBy: user?.name || "Officer",
    });
    toast.success("Contract created successfully");
    setOpen(false);
    setForm({ vendorId: "", poId: "", title: "", startDate: "", endDate: "", value: "", notes: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> New Contract</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Create New Contract</DialogTitle></DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Contract Title *</Label>
              <Input placeholder="e.g. Annual Supply Agreement" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Vendor *</Label>
              <Select value={form.vendorId} onValueChange={(v) => setForm((f) => ({ ...f, vendorId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>{vendors.filter((v) => v.status === "Active").map((v) => <SelectItem key={v.id} value={v.id}>{v.company}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Linked PO</Label>
              <Select value={form.poId} onValueChange={(v) => setForm((f) => ({ ...f, poId: v }))}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>{pos.map((p) => <SelectItem key={p.id} value={p.id}>{p.code}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Start Date *</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>End Date *</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Contract Value (₹) *</Label>
              <Input type="number" placeholder="e.g. 500000" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Notes</Label>
              <Textarea placeholder="Additional terms or notes..." rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <Button className="w-full" onClick={handleSubmit}>Create Contract</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContractsPage() {
  const { contracts, user } = useStore();
  const [tab, setTab] = useState<ContractStatus | "All">("All");

  const expiryAlerts = contracts.filter((c) => c.renewalAlert && c.status === "Active");
  const filtered = tab === "All" ? contracts : contracts.filter((c) => c.status === tab);

  const counts = {
    All: contracts.length,
    Active: contracts.filter((c) => c.status === "Active").length,
    Expired: contracts.filter((c) => c.status === "Expired").length,
    Terminated: contracts.filter((c) => c.status === "Terminated").length,
    Renewed: contracts.filter((c) => c.status === "Renewed").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Contract Management" description="Manage vendor contracts, renewals, and compliance tracking.">
        {user?.role !== "Vendor" && <NewContractDialog />}
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Contracts", value: counts.All, icon: FileText, color: "text-primary" },
          { label: "Active", value: counts.Active, icon: CheckCircle2, color: "text-success" },
          { label: "Expiry Alerts", value: expiryAlerts.length, icon: AlertTriangle, color: "text-warning" },
          { label: "Total Value", value: formatINR(contracts.filter(c => c.status === "Active").reduce((s, c) => s + c.value, 0)), icon: DollarSign, color: "text-primary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 bg-muted ${color}`}><Icon className="h-4 w-4" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-lg font-bold">{value}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expiry Alerts Banner */}
      {expiryAlerts.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="font-medium text-sm text-warning-foreground">
              {expiryAlerts.length} contract(s) expiring within 60 days — action required
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {expiryAlerts.map((c) => (
              <div key={c.id} className="text-xs text-muted-foreground ml-6">
                • {c.code} — {c.title} (expires {new Date(c.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="w-full sm:w-auto">
          {(["All", "Active", "Expired", "Terminated", "Renewed"] as const).map((t) => (
            <TabsTrigger key={t} value={t} className="gap-1.5">
              {t} <span className="text-[10px] rounded-full bg-muted px-1.5">{counts[t]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No {tab !== "All" ? tab.toLowerCase() : ""} contracts found.</p>
              {user?.role !== "Vendor" && <NewContractDialog />}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c) => <ContractCard key={c.id} contract={c} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
