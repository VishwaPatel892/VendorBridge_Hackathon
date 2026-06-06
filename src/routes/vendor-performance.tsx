import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Star, Award, Shield, Truck, Zap } from "lucide-react";

export const Route = createFileRoute("/vendor-performance")({
  component: VendorPerformancePage,
});

function scoreBadge(score: number) {
  if (score >= 90) return { label: "Excellent", color: "bg-success/15 text-success border-success/30" };
  if (score >= 75) return { label: "Good", color: "bg-primary/15 text-primary border-primary/30" };
  if (score >= 60) return { label: "Fair", color: "bg-warning/15 text-warning border-warning/30" };
  return { label: "Poor", color: "bg-destructive/15 text-destructive border-destructive/30" };
}

function scoreColor(score: number) {
  if (score >= 90) return "text-success";
  if (score >= 75) return "text-primary";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

function TrendIcon({ score }: { score: number }) {
  if (score >= 80) return <TrendingUp className="h-3.5 w-3.5 text-success" />;
  if (score >= 60) return <Minus className="h-3.5 w-3.5 text-warning" />;
  return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
}

const KPI_ICONS = {
  delivery: Truck,
  quality: Award,
  response: Zap,
  compliance: Shield,
};

function VendorPerformanceCard({ vendorId }: { vendorId: string }) {
  const { vendors, vendorPerformance } = useStore();
  const vendor = vendors.find((v) => v.id === vendorId);
  const perf = vendorPerformance.find((p) => p.vendorId === vendorId);
  if (!vendor || !perf) return null;

  const badge = scoreBadge(perf.overallScore);

  const radarData = [
    { metric: "Delivery", score: perf.deliveryScore },
    { metric: "Quality", score: perf.qualityScore },
    { metric: "Response", score: perf.responseScore },
    { metric: "Compliance", score: perf.complianceScore },
  ];

  const kpis = [
    { label: "Delivery", value: perf.deliveryScore, icon: KPI_ICONS.delivery },
    { label: "Quality", value: perf.qualityScore, icon: KPI_ICONS.quality },
    { label: "Response", value: perf.responseScore, icon: KPI_ICONS.response },
    { label: "Compliance", value: perf.complianceScore, icon: KPI_ICONS.compliance },
  ];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardHeader className="pb-3 bg-gradient-to-br from-card to-muted/30">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{vendor.company}</CardTitle>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              <span className="text-sm text-muted-foreground">{vendor.rating} rating</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{vendor.category}</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${scoreColor(perf.overallScore)}`}>{perf.overallScore}</div>
            <Badge className={`text-[10px] border ${badge.color}`}>{badge.label}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Radar Chart */}
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="var(--color-primary)"
                fill="var(--color-primary)"
                fillOpacity={0.18}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(v) => [`${v}/100`, "Score"]}
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* KPI Bars */}
        <div className="space-y-2.5">
          {kpis.map(({ label, value, icon: Icon }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3 w-3" /> {label}
                </div>
                <div className="flex items-center gap-1">
                  <TrendIcon score={value} />
                  <span className={`text-xs font-semibold ${scoreColor(value)}`}>{value}/100</span>
                </div>
              </div>
              <Progress value={value} className="h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function VendorPerformancePage() {
  const { vendorPerformance, vendors } = useStore();

  const sorted = [...vendorPerformance].sort((a, b) => b.overallScore - a.overallScore);
  const avg = vendorPerformance.reduce((s, p) => s + p.overallScore, 0) / (vendorPerformance.length || 1);
  const excellent = vendorPerformance.filter((p) => p.overallScore >= 90).length;
  const atRisk = vendorPerformance.filter((p) => p.overallScore < 60).length;
  const topPerformer = vendors.find((v) => v.id === sorted[0]?.vendorId);

  return (
    <div className="space-y-6">
      <PageHeader title="Vendor Performance Scorecard" description="Track vendor KPIs: delivery, quality, responsiveness, and compliance." />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Avg Health Score", value: avg.toFixed(1), icon: TrendingUp, color: "text-primary" },
          { label: "Excellent (90+)", value: excellent, icon: Award, color: "text-success" },
          { label: "At Risk (<60)", value: atRisk, icon: TrendingDown, color: "text-destructive" },
          { label: "Top Vendor", value: topPerformer?.company?.split(" ")[0] ?? "—", icon: Star, color: "text-warning" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 bg-muted ${color}`}><Icon className="h-4 w-4" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-lg font-bold truncate">{value}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Performance Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="pb-2 text-left font-medium w-8">#</th>
                  <th className="pb-2 text-left font-medium">Vendor</th>
                  <th className="pb-2 text-center font-medium">Delivery</th>
                  <th className="pb-2 text-center font-medium">Quality</th>
                  <th className="pb-2 text-center font-medium">Response</th>
                  <th className="pb-2 text-center font-medium">Compliance</th>
                  <th className="pb-2 text-right font-medium">Health Score</th>
                  <th className="pb-2 text-right font-medium">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sorted.map((perf, i) => {
                  const vendor = vendors.find((v) => v.id === perf.vendorId);
                  const badge = scoreBadge(perf.overallScore);
                  return (
                    <tr key={perf.vendorId} className="hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 text-muted-foreground font-mono text-xs">{i + 1}</td>
                      <td className="py-2.5 font-medium">{vendor?.company ?? "Unknown"}</td>
                      {[perf.deliveryScore, perf.qualityScore, perf.responseScore, perf.complianceScore].map((s, j) => (
                        <td key={j} className={`py-2.5 text-center font-mono text-xs ${scoreColor(s)}`}>{s}</td>
                      ))}
                      <td className={`py-2.5 text-right font-bold text-base ${scoreColor(perf.overallScore)}`}>{perf.overallScore}</td>
                      <td className="py-2.5 text-right">
                        <Badge className={`text-[10px] border ${badge.color}`}>{badge.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Individual Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((p) => (
          <VendorPerformanceCard key={p.vendorId} vendorId={p.vendorId} />
        ))}
      </div>
    </div>
  );
}
