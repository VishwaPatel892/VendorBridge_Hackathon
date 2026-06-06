import { useStore } from "@/lib/store";
import type { RiskLevel } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ShieldAlert, ShieldX, Info, X } from "lucide-react";

const RISK_CONFIG: Record<RiskLevel, { label: string; icon: typeof AlertTriangle; cardClass: string; badgeClass: string }> = {
  Low: {
    label: "Low Risk",
    icon: Info,
    cardClass: "border-l-4 border-l-muted-foreground/30 bg-muted/30",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
  Medium: {
    label: "Medium Risk",
    icon: AlertTriangle,
    cardClass: "border-l-4 border-l-warning/60 bg-warning/5",
    badgeClass: "bg-warning/15 text-warning border-warning/30",
  },
  High: {
    label: "High Risk",
    icon: ShieldAlert,
    cardClass: "border-l-4 border-l-destructive/60 bg-destructive/5",
    badgeClass: "bg-destructive/15 text-destructive border-destructive/30",
  },
  Critical: {
    label: "Critical",
    icon: ShieldX,
    cardClass: "border-l-4 border-l-destructive bg-destructive/10 animate-pulse",
    badgeClass: "bg-destructive text-destructive-foreground border-destructive",
  },
};

const FRAUD_TYPE_LABELS: Record<string, string> = {
  duplicate_vendor: "Duplicate Vendor",
  abnormal_pricing: "Abnormal Pricing",
  gst_duplication: "GST Duplication",
  suspicious_quotation: "Suspicious Quotation",
  procurement_anomaly: "Procurement Anomaly",
};

interface FraudAlertWidgetProps {
  maxItems?: number;
  showTitle?: boolean;
  rfqId?: string;
  vendorId?: string;
}

export function FraudAlertWidget({ maxItems = 5, showTitle = true, rfqId, vendorId }: FraudAlertWidgetProps) {
  const { fraudAlerts, dismissFraudAlert } = useStore();

  const active = fraudAlerts.filter((a) => {
    if (a.dismissed) return false;
    if (rfqId && a.rfqId !== rfqId) return false;
    if (vendorId && a.vendorId !== vendorId) return false;
    return true;
  });

  if (active.length === 0) return null;

  const shown = active.slice(0, maxItems);
  const critical = active.filter((a) => a.riskLevel === "Critical").length;
  const high = active.filter((a) => a.riskLevel === "High").length;

  return (
    <Card className={critical > 0 ? "ring-1 ring-destructive/40" : ""}>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            Fraud Detection Alerts
            <div className="ml-auto flex items-center gap-1.5">
              {critical > 0 && <Badge className="text-[10px] bg-destructive text-destructive-foreground border-destructive">{critical} Critical</Badge>}
              {high > 0 && <Badge className="text-[10px] bg-destructive/15 text-destructive border-destructive/30">{high} High</Badge>}
            </div>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "pt-0" : "pt-4"}>
        <div className="space-y-2.5">
          {shown.map((alert) => {
            const cfg = RISK_CONFIG[alert.riskLevel];
            const Icon = cfg.icon;
            return (
              <div key={alert.id} className={`flex items-start gap-3 rounded-lg p-3 ${cfg.cardClass}`}>
                <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={`text-[10px] border ${cfg.badgeClass}`}>{cfg.label}</Badge>
                    <span className="text-[10px] text-muted-foreground">{FRAUD_TYPE_LABELS[alert.type] ?? alert.type}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {new Date(alert.detectedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/80">{alert.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => dismissFraudAlert(alert.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
          {active.length > maxItems && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              +{active.length - maxItems} more alerts not shown
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
