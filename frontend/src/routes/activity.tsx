import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import {
  FileText, Quote, ShieldCheck, Receipt, ShoppingCart,
  Building2, Activity, Clock, CheckCircle2, AlertCircle,
  Send, Plus, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/activity")({
  head: () => ({ meta: [{ title: "Activity & Logs — VendorBridge" }] }),
  component: ActivityPage,
});

type FilterType = "All" | "RFQ" | "Approvals" | "Invoices" | "Vendors" | "PO";

const moduleIcons: Record<string, typeof FileText> = {
  RFQ: FileText,
  Quotation: Quote,
  Approval: ShieldCheck,
  Invoice: Receipt,
  PO: ShoppingCart,
  Vendor: Building2,
};

const moduleColors: Record<string, string> = {
  RFQ: "bg-blue-500/15 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400",
  Quotation: "bg-purple-500/15 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400",
  Approval: "bg-amber-500/15 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400",
  Invoice: "bg-emerald-500/15 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400",
  PO: "bg-orange-500/15 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400",
  Vendor: "bg-teal-500/15 text-teal-500 dark:bg-teal-500/20 dark:text-teal-400",
};

const actionIcons: Record<string, typeof FileText> = {
  Created: Plus,
  Approved: CheckCircle2,
  Submitted: Send,
  Generated: FileText,
  Rejected: AlertCircle,
  Deleted: Trash2,
  Sent: Send,
};

function getActionIcon(action: string) {
  for (const [key, Icon] of Object.entries(actionIcons)) {
    if (action.toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return Clock;
}

const FILTERS: { label: FilterType; module?: string }[] = [
  { label: "All" },
  { label: "RFQ", module: "RFQ" },
  { label: "Approvals", module: "Approval" },
  { label: "Invoices", module: "Invoice" },
  { label: "PO", module: "PO" },
  { label: "Vendors", module: "Vendor" },
];

function ActivityPage() {
  const { activity } = useStore();
  const [filter, setFilter] = useState<FilterType>("All");

  const filtered = filter === "All"
    ? activity
    : activity.filter((a) => {
        const filterModule = FILTERS.find((f) => f.label === filter)?.module;
        return a.module === filterModule;
      });

  // Group activities by date
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, item) => {
    const date = new Date(item.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Activity & Logs"
        description="Procurement audit trail — track all actions across the platform."
      />

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.label}
            variant={filter === f.label ? "default" : "outline"}
            size="sm"
            className={
              filter === f.label
                ? "rounded-full px-5 shadow-sm"
                : "rounded-full px-5 hover:bg-accent"
            }
            onClick={() => setFilter(f.label)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Activity Timeline */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Activity className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">No activity found</p>
              <p className="text-xs">Try changing the filter to see more results.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                {/* Date header */}
                <div className="sticky top-0 z-10 border-b bg-muted/50 px-6 py-2.5 backdrop-blur">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {date}
                  </span>
                </div>

                {/* Activity items */}
                <ul>
                  {items.map((item, idx) => {
                    const ModuleIcon = moduleIcons[item.module] || Activity;
                    const ActionIcon = getActionIcon(item.action);
                    const colorClass = moduleColors[item.module] || "bg-muted text-muted-foreground";

                    return (
                      <li
                        key={item.id}
                        className="group relative flex items-start gap-4 px-6 py-4 transition-colors hover:bg-accent/30"
                      >
                        {/* Timeline connector line */}
                        {idx < items.length - 1 && (
                          <div className="absolute left-[2.65rem] top-14 h-[calc(100%-2rem)] w-px bg-border" />
                        )}

                        {/* Icon */}
                        <div
                          className={`relative z-[1] grid h-10 w-10 shrink-0 place-items-center rounded-xl ${colorClass} transition-transform group-hover:scale-110`}
                        >
                          <ModuleIcon className="h-4.5 w-4.5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium leading-snug text-foreground">
                                {item.action}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <ActionIcon className="h-3 w-3" />
                                  {item.user}
                                </span>
                                <span className="text-border">•</span>
                                <span className="capitalize">{item.module}</span>
                              </div>
                            </div>
                            <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
