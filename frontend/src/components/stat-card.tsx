import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, icon: Icon, trend, accent }: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  accent?: "primary" | "success" | "warning" | "destructive";
}) {
  const accentClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  }[accent ?? "primary"];
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start gap-4 p-5">
        <div className={`grid h-11 w-11 place-items-center rounded-lg ${accentClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 truncate text-2xl font-semibold tracking-tight">{value}</div>
          {trend && <div className="mt-1 text-xs text-muted-foreground">{trend}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
