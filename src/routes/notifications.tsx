import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";
import {
  Bell, FileText, Quote, ShieldCheck, Receipt, ShoppingCart,
  CheckCheck, Trash2, X, BellOff, Filter, FileSignature, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — VendorBridge" }] }),
  component: NotificationsPage,
});

const icons: Record<string, typeof FileText> = {
  rfq: FileText,
  quotation: Quote,
  approval: ShieldCheck,
  invoice: Receipt,
  po: ShoppingCart,
  contract: FileSignature,
};

const iconColors: Record<string, string> = {
  rfq: "bg-blue-500/15 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400",
  quotation: "bg-purple-500/15 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400",
  approval: "bg-amber-500/15 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400",
  invoice: "bg-emerald-500/15 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400",
  po: "bg-orange-500/15 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400",
  contract: "bg-teal-500/15 text-teal-500 dark:bg-teal-500/20 dark:text-teal-400",
};

type ReadFilterType = "all" | "unread" | "read";
type CategoryFilterType = "all" | "rfq" | "quotation" | "approval" | "po" | "invoice" | "contract";

function isUrgent(message: string, type: string) {
  const msg = message.toLowerCase();
  return type === "approval" || msg.includes("critical") || msg.includes("urgent") || msg.includes("pending") || msg.includes("watchlist");
}

function NotificationsPage() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
    deleteNotification,
  } = useStore();
  
  const [readFilter, setReadFilter] = useState<ReadFilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterType>("all");

  const filtered = notifications.filter((n) => {
    // Read status filter
    if (readFilter === "unread" && n.read) return false;
    if (readFilter === "read" && !n.read) return false;

    // Category filter
    if (categoryFilter !== "all") {
      if (categoryFilter === "contract") {
        return n.message.toLowerCase().includes("contract");
      }
      return n.type === categoryFilter;
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    toast.success("All notifications marked as read");
  };

  const handleClearAll = () => {
    clearAllNotifications();
    toast.success("All notifications cleared");
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(id);
    toast.success("Notification removed");
  };

  const handleMarkRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markNotificationRead(id);
  };

  const READ_FILTERS: { label: string; value: ReadFilterType; count?: number }[] = [
    { label: "All Status", value: "all", count: notifications.length },
    { label: "Unread", value: "unread", count: unreadCount },
    { label: "Read", value: "read", count: notifications.length - unreadCount },
  ];

  const CATEGORIES: { label: string; value: CategoryFilterType; count?: number }[] = [
    { label: "All Categories", value: "all", count: notifications.length },
    { label: "RFQs", value: "rfq", count: notifications.filter(n => n.type === "rfq").length },
    { label: "Quotations", value: "quotation", count: notifications.filter(n => n.type === "quotation").length },
    { label: "Approvals", value: "approval", count: notifications.filter(n => n.type === "approval").length },
    { label: "Purchase Orders", value: "po", count: notifications.filter(n => n.type === "po" && !n.message.toLowerCase().includes("contract")).length },
    { label: "Invoices", value: "invoice", count: notifications.filter(n => n.type === "invoice").length },
    { label: "Contracts", value: "contract", count: notifications.filter(n => n.message.toLowerCase().includes("contract")).length },
  ];

  // Grouping notifications by Date
  const getGroupedNotifications = (list: typeof notifications) => {
    const todayList: typeof notifications = [];
    const yesterdayList: typeof notifications = [];
    const olderList: typeof notifications = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;

    list.forEach((n) => {
      const time = new Date(n.createdAt).getTime();
      if (time >= startOfToday) {
        todayList.push(n);
      } else if (time >= startOfYesterday) {
        yesterdayList.push(n);
      } else {
        olderList.push(n);
      }
    });

    return [
      { title: "Today", items: todayList },
      { title: "Yesterday", items: yesterdayList },
      { title: "Older Activity", items: olderList },
    ].filter(g => g.items.length > 0);
  };

  const grouped = getGroupedNotifications(filtered);

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications Center" description="Real-time audit trail and process alerts across procurement workflows." />

      <Card className="overflow-hidden shadow-md">
        <CardHeader className="flex flex-col gap-4 border-b bg-muted/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2.5">
            {/* Read / Unread Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Filter className="mr-1 h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {READ_FILTERS.map((f) => (
                <Button
                  key={f.value}
                  variant={readFilter === f.value ? "default" : "outline"}
                  size="sm"
                  className="rounded-full h-8 text-[11px] px-3 font-medium"
                  onClick={() => setReadFilter(f.value)}
                >
                  {f.label}
                  {f.count !== undefined && f.count > 0 && (
                    <span className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                      readFilter === f.value
                        ? "bg-primary-foreground text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {f.count}
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-all ${
                    categoryFilter === cat.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:border-primary/50 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {cat.label}
                  {cat.count !== undefined && cat.count > 0 && (
                    <span className="ml-1 text-[9px] opacity-75 font-mono">({cat.count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleMarkAllRead}>
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleClearAll}>
                <Trash2 className="h-3.5 w-3.5" />
                Clear all
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-muted/40">
                <BellOff className="h-7 w-7 opacity-50 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                No notifications found
              </p>
              <p className="mt-1 text-xs max-w-xs text-center leading-relaxed">
                {readFilter === "unread"
                  ? "All your notifications under the selected category have been read."
                  : "We couldn't find any notifications matching your filters."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {grouped.map((group) => (
                <div key={group.title} className="space-y-0">
                  {/* Group Header */}
                  <div className="bg-muted/30 px-6 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-t first:border-t-0">
                    {group.title}
                  </div>
                  
                  <ul className="divide-y divide-muted/30">
                    {group.items.map((n) => {
                      const isContract = n.message.toLowerCase().includes("contract");
                      const typeIcon = isContract ? "contract" : n.type;
                      const Icon = icons[typeIcon] || Bell;
                      const colorClass = iconColors[typeIcon] || "bg-muted text-muted-foreground";
                      const urgent = isUrgent(n.message, n.type);

                      return (
                        <li
                          key={n.id}
                          className={`group relative flex items-start gap-4 px-6 py-4 transition-colors cursor-pointer hover:bg-accent/20 ${
                            !n.read ? "bg-primary/5" : ""
                          }`}
                          onClick={() => markNotificationRead(n.id)}
                        >
                          {/* Unread indicator dot */}
                          {!n.read && (
                            <span className="absolute left-2.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
                          )}

                          {/* Icon */}
                          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${colorClass} border shadow-sm`}>
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                              <div className={`text-sm leading-snug ${!n.read ? "font-medium text-foreground" : "text-foreground/85"}`}>
                                {n.message}
                              </div>
                              
                              {/* Urgent Badge */}
                              {urgent && (
                                <Badge className="shrink-0 text-[9px] font-bold bg-rose-500/15 text-rose-600 border border-rose-500/25 hover:bg-rose-500/20 gap-1 rounded-md px-1.5 py-0 h-5">
                                  <AlertCircle className="h-2.5 w-2.5" /> URGENT
                                </Badge>
                              )}
                            </div>

                            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span>
                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                              </span>
                              <span>•</span>
                              <span className="font-semibold text-foreground/70">
                                {format(new Date(n.createdAt), "dd MMM yyyy, HH:mm")}
                              </span>
                              <span>•</span>
                              <span className="rounded bg-muted/80 px-1.5 py-0.2 uppercase text-[9px] font-bold tracking-wider text-muted-foreground">
                                {isContract ? "contract" : n.type}
                              </span>
                            </div>
                          </div>

                          {/* Action buttons — visible on hover */}
                          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {!n.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                                title="Mark as read"
                                onClick={(e) => handleMarkRead(n.id, e)}
                              >
                                <CheckCheck className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-rose-500/10"
                              title="Delete notification"
                              onClick={(e) => handleDelete(n.id, e)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
