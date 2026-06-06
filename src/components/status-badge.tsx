import { Badge } from "@/components/ui/badge";

const map: Record<string, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Inactive: "bg-muted text-muted-foreground border-border",
  Blacklisted: "bg-destructive/15 text-destructive border-destructive/30",
  Open: "bg-primary/15 text-primary border-primary/30",
  Draft: "bg-muted text-muted-foreground border-border",
  Closed: "bg-muted text-muted-foreground border-border",
  Awarded: "bg-success/15 text-success border-success/30",
  Submitted: "bg-primary/15 text-primary border-primary/30",
  Selected: "bg-success/15 text-success border-success/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
  Pending: "bg-warning/20 text-warning-foreground border-warning/40",
  Approved: "bg-success/15 text-success border-success/30",
  Issued: "bg-primary/15 text-primary border-primary/30",
  Fulfilled: "bg-success/15 text-success border-success/30",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  Sent: "bg-primary/15 text-primary border-primary/30",
  Paid: "bg-success/15 text-success border-success/30",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={map[status] || "bg-muted"}>{status}</Badge>;
}
