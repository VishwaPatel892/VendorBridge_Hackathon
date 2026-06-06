import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatINR, useStore } from "@/lib/store";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import type { Approval } from "@/lib/types";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "Approvals — VendorBridge" }] }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const { approvals, decideApproval } = useStore();
  const [tab, setTab] = useState("Pending");
  const [target, setTarget] = useState<{ a: Approval; decision: "Approved" | "Rejected" } | null>(null);
  const [remarks, setRemarks] = useState("");

  const list = approvals.filter((a) => a.status === tab);

  return (
    <div>
      <PageHeader title="Approval workflow" description="Review pending requests, approve or reject with remarks." />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {["Pending", "Approved", "Rejected"].map((s) => (
            <TabsTrigger key={s} value={s}>{s} ({approvals.filter((a) => a.status === s).length})</TabsTrigger>
          ))}
        </TabsList>
        {["Pending", "Approved", "Rejected"].map((s) => (
          <TabsContent key={s} value={s} className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Module</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Requested by</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell><span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">{a.module}</span></TableCell>
                          <TableCell><div className="font-medium">{a.refLabel}</div>{a.remarks && <div className="text-xs text-muted-foreground">"{a.remarks}"</div>}</TableCell>
                          <TableCell>{a.amount ? formatINR(a.amount) : "—"}</TableCell>
                          <TableCell>{a.requestedBy}</TableCell>
                          <TableCell>{format(new Date(a.createdAt), "dd MMM yyyy")}</TableCell>
                          <TableCell><StatusBadge status={a.status} /></TableCell>
                          <TableCell className="text-right">
                            {a.status === "Pending" && (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" onClick={() => { setTarget({ a, decision: "Approved" }); setRemarks(""); }}>
                                  <Check className="mr-1 h-4 w-4" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => { setTarget({ a, decision: "Rejected" }); setRemarks(""); }}>
                                  <X className="mr-1 h-4 w-4" /> Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {list.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Nothing here.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{target?.decision} — {target?.a.refLabel}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional notes for the audit trail" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
            <Button onClick={() => {
              if (!target) return;
              decideApproval(target.a.id, target.decision, remarks);
              toast.success(`Request ${target.decision.toLowerCase()}`);
              setTarget(null);
            }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
