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
import { Check, X, Clock, HelpCircle, User, MessageSquare } from "lucide-react";
import type { MultiLevelApproval, ApprovalLevel } from "@/lib/types";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "Approvals — VendorBridge" }] }),
  component: ApprovalsPage,
});

function canUserApprove(userRole: string | undefined, levelRole: string) {
  if (!userRole) return false;
  if (userRole === "Admin") return true;
  if (levelRole === "Procurement Officer") return userRole === "Procurement Officer";
  if (["Team Lead", "Manager", "Finance", "Director"].includes(levelRole)) {
    return userRole === "Manager" || userRole === "Admin";
  }
  return false;
}

function ApprovalsPage() {
  const { multiLevelApprovals, advanceApprovalLevel, user } = useStore();
  const [tab, setTab] = useState("Pending");
  const [target, setTarget] = useState<{ a: MultiLevelApproval; decision: "Approved" | "Rejected" } | null>(null);
  const [remarks, setRemarks] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const list = multiLevelApprovals.filter((a) => a.status === tab);

  return (
    <div>
      <PageHeader title="Approval Workflow" description="Review multi-level requests, track progression, and approve/reject with remarks." />
      
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {["Pending", "Approved", "Rejected"].map((s) => (
            <TabsTrigger key={s} value={s}>
              {s} ({multiLevelApprovals.filter((a) => a.status === s).length})
            </TabsTrigger>
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
                        <TableHead className="w-[100px]">Module</TableHead>
                        <TableHead>Reference / Details</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Requested by</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Workflow Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((a) => {
                        const isExpanded = expandedId === a.id;
                        const activeLevelObj = a.levels.find((l) => l.level === a.currentLevel);
                        const canApproveCurrentLevel = activeLevelObj && canUserApprove(user?.role, activeLevelObj.role);

                        return (
                          <>
                            <TableRow 
                              key={a.id}
                              className={`cursor-pointer hover:bg-muted/30 transition-all ${isExpanded ? "bg-muted/10 border-b-0" : ""}`}
                              onClick={() => setExpandedId(isExpanded ? null : a.id)}
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{a.module}</span>
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold text-foreground">{a.refLabel}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">Click to view approval history & timeline</div>
                              </TableCell>
                              <TableCell className="font-mono font-medium text-foreground">{a.amount ? formatINR(a.amount) : "—"}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">{a.requestedBy}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">{format(new Date(a.createdAt), "dd MMM yyyy")}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {a.levels.map((lvl) => {
                                    let bg = "bg-muted-foreground/20";
                                    if (lvl.status === "Approved") bg = "bg-emerald-500";
                                    if (lvl.status === "Rejected") bg = "bg-rose-500";
                                    if (lvl.status === "Pending" && lvl.level === a.currentLevel) bg = "bg-amber-500 animate-pulse";
                                    
                                    return (
                                      <div 
                                        key={lvl.level}
                                        className={`h-2.5 w-6 rounded-full ${bg}`}
                                        title={`${lvl.role}: ${lvl.status}`}
                                      />
                                    );
                                  })}
                                  <span className="text-[11px] font-semibold text-muted-foreground ml-1">
                                    {a.status === "Approved" ? "Completed" : `${a.currentLevel}/5`}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={a.status} />
                              </TableCell>
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                {a.status === "Pending" && canApproveCurrentLevel && (
                                  <div className="flex justify-end gap-1.5">
                                    <Button 
                                      size="sm"
                                      className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                      onClick={() => { setTarget({ a, decision: "Approved" }); setRemarks(""); }}
                                    >
                                      <Check className="h-3.5 w-3.5" /> Approve
                                    </Button>
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      className="h-8 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-950 dark:hover:bg-rose-950/20 gap-1"
                                      onClick={() => { setTarget({ a, decision: "Rejected" }); setRemarks(""); }}
                                    >
                                      <X className="h-3.5 w-3.5" /> Reject
                                    </Button>
                                  </div>
                                )}
                                {a.status === "Pending" && !canApproveCurrentLevel && activeLevelObj && (
                                  <span className="text-xs text-muted-foreground italic">
                                    Awaiting {activeLevelObj.role}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>

                            {isExpanded && (
                              <TableRow className="bg-muted/10">
                                <TableCell colSpan={8} className="p-6 border-t border-muted/50">
                                  <div className="space-y-4 max-w-4xl">
                                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-primary" /> Approval Timeline Breakdown
                                    </h4>

                                    <div className="relative flex flex-col md:flex-row items-stretch md:items-start justify-between gap-4 md:gap-2 pt-2">
                                      {/* Horizontal connecting line on desktop */}
                                      <div className="absolute top-5 left-8 right-8 hidden md:block h-0.5 bg-border -z-10" />

                                      {a.levels.map((lvl, idx) => {
                                        let statusColor = "text-muted-foreground border-border bg-card";
                                        let statusIcon = <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
                                        
                                        if (lvl.status === "Approved") {
                                          statusColor = "text-emerald-700 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400";
                                          statusIcon = <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
                                        } else if (lvl.status === "Rejected") {
                                          statusColor = "text-rose-700 border-rose-500 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400";
                                          statusIcon = <X className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />;
                                        } else if (lvl.status === "Pending" && lvl.level === a.currentLevel) {
                                          statusColor = "text-amber-700 border-amber-500 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse";
                                          statusIcon = <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
                                        }

                                        return (
                                          <div key={lvl.level} className="flex flex-row md:flex-col items-center md:items-center flex-1 text-center gap-3 md:gap-2 relative">
                                            {/* Level Badge Circle */}
                                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-bold text-sm shadow-sm transition-all ${statusColor}`}>
                                              {lvl.status === "Pending" && lvl.level !== a.currentLevel ? lvl.level : statusIcon}
                                            </div>

                                            {/* Details */}
                                            <div className="text-left md:text-center min-w-0">
                                              <p className="font-semibold text-xs text-foreground truncate">{lvl.role}</p>
                                              <p className="text-[11px] text-muted-foreground mt-0.5">{lvl.approverName}</p>
                                              
                                              {lvl.decidedAt && (
                                                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                                  {format(new Date(lvl.decidedAt), "dd MMM, HH:mm")}
                                                </p>
                                              )}
                                              
                                              {lvl.remarks && (
                                                <div className="mt-1.5 rounded bg-muted/60 p-1.5 text-[10px] text-foreground border text-left max-w-[200px] mx-auto flex gap-1 items-start">
                                                  <MessageSquare className="h-3 w-3 shrink-0 text-muted-foreground mt-0.5" />
                                                  <span className="italic">"{lvl.remarks}"</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {a.status === "Pending" && activeLevelObj && (
                                      <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                        <Clock className="h-4 w-4 shrink-0" />
                                        <span>
                                          Currently awaiting review at <strong>Level {a.currentLevel}: {activeLevelObj.role}</strong> ({activeLevelObj.approverName}). 
                                          {canApproveCurrentLevel ? " You have permission to approve/reject this level." : " You will be able to review this request once it advances to your level."}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        );
                      })}
                      {list.length === 0 && <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">No approvals found in this state.</TableCell></TableRow>}
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
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {target?.decision === "Approved" ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="h-4 w-4" /></span>
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-600"><X className="h-4 w-4" /></span>
              )}
              {target?.decision} Level {target?.a.currentLevel} — {target?.a.refLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Review Comments / Remarks</Label>
            <Textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Provide optional remarks or notes for the audit trail" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
            <Button 
              className={target?.decision === "Approved" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}
              onClick={() => {
                if (!target) return;
                advanceApprovalLevel(target.a.id, target.decision, remarks);
                toast.success(`Level ${target.a.currentLevel} ${target.decision.toLowerCase()} successfully!`);
                setTarget(null);
              }}
            >
              Confirm {target?.decision}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
