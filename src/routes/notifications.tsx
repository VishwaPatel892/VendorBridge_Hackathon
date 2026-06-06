import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { Bell, FileText, Quote, ShieldCheck, Receipt, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — VendorBridge" }] }),
  component: NotificationsPage,
});

const icons = { rfq: FileText, quotation: Quote, approval: ShieldCheck, invoice: Receipt, po: ShoppingCart };

function NotificationsPage() {
  const { notifications, markNotificationRead } = useStore();
  return (
    <div>
      <PageHeader title="Notifications" description="Real-time alerts across procurement activity." />
      <Card>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Bell className="mx-auto mb-2 h-6 w-6" />You're all caught up.
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => {
                const Icon = icons[n.type] || Bell;
                return (
                  <li key={n.id} className={`flex items-start gap-3 px-6 py-4 ${!n.read ? "bg-primary/5" : ""}`} onClick={() => markNotificationRead(n.id)}>
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground"><Icon className="h-4 w-4" /></div>
                    <div className="flex-1">
                      <div className="text-sm">{n.message}</div>
                      <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                    </div>
                    {!n.read && <span className="mt-2 h-2 w-2 rounded-full bg-primary" />}
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
