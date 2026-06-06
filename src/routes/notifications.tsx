import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import {
  Bell, FileText, Quote, ShieldCheck, Receipt, ShoppingCart,
  CheckCheck, Trash2, X, BellOff, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
};

const iconColors: Record<string, string> = {
  rfq: "bg-blue-500/15 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400",
  quotation: "bg-purple-500/15 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400",
  approval: "bg-amber-500/15 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400",
  invoice: "bg-emerald-500/15 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400",
  po: "bg-orange-500/15 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400",
};

type FilterType = "all" | "unread" | "read";

function NotificationsPage() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
    deleteNotification,
  } = useStore();
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
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

  const FILTERS: { label: string; value: FilterType; count?: number }[] = [
    { label: "All", value: "all", count: notifications.length },
    { label: "Unread", value: "unread", count: unreadCount },
    { label: "Read", value: "read", count: notifications.length - unreadCount },
  ];

  return (
    <div>
      <PageHeader title="Notifications" description="Real-time alerts across procurement activity." />

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5">
            <Filter className="mr-1 h-4 w-4 text-muted-foreground" />
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "outline"}
                size="sm"
                className="rounded-full px-4 text-xs"
                onClick={() => setFilter(f.value)}
              >
                {f.label}
                {f.count !== undefined && f.count > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    filter === f.value
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {f.count}
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleMarkAllRead}>
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleClearAll}>
                <Trash2 className="h-3.5 w-3.5" />
                Clear all
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-muted/50">
                <BellOff className="h-7 w-7 opacity-50" />
              </div>
              <p className="text-sm font-medium">
                {filter === "unread"
                  ? "No unread notifications"
                  : filter === "read"
                    ? "No read notifications"
                    : "You're all caught up!"}
              </p>
              <p className="mt-1 text-xs">
                {filter === "unread"
                  ? "All your notifications have been read."
                  : filter === "read"
                    ? "You haven't read any notifications yet."
                    : "When there's new activity, it will appear here."}
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((n) => {
                const Icon = icons[n.type] || Bell;
                const colorClass = iconColors[n.type] || "bg-muted text-muted-foreground";
                return (
                  <li
                    key={n.id}
                    className={`group relative flex items-start gap-3 px-6 py-4 transition-colors cursor-pointer hover:bg-accent/30 ${
                      !n.read ? "bg-primary/5" : ""
                    }`}
                    onClick={() => markNotificationRead(n.id)}
                  >
                    {/* Unread indicator dot */}
                    {!n.read && (
                      <span className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
                    )}

                    {/* Icon */}
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${colorClass}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm leading-snug ${!n.read ? "font-medium text-foreground" : "text-foreground/80"}`}>
                        {n.message}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {n.type}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons — visible on hover */}
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {!n.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Mark as read"
                          onClick={(e) => handleMarkRead(n.id, e)}
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
