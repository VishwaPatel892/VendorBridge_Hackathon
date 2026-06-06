import { createFileRoute } from "@tanstack/react-router";
import { useStore, formatINR } from "@/lib/store";
import { monthlySavings } from "@/lib/mock-data";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, PiggyBank, Target, BarChart2 } from "lucide-react";

export const Route = createFileRoute("/savings")({
  component: SavingsPage,
});

function SavingsPage() {
  const { savings, vendors, rfqs } = useStore();

  const totalSavings = savings.reduce((s, r) => s + r.savings, 0);
  const totalBudget = savings.reduce((s, r) => s + r.rfqBudget, 0);
  const avgPct = savings.length ? savings.reduce((s, r) => s + r.savingsPct, 0) / savings.length : 0;
  const bestRFQ = [...savings].sort((a, b) => b.savings - a.savings)[0];

  // Monthly aggregated for chart
  const chartData = monthlySavings;

  // Vendor-wise savings
  const vendorSavings = vendors.map((v) => {
    const recs = savings.filter((s) => s.vendorId === v.id);
    return {
      vendor: v.company,
      savings: recs.reduce((s, r) => s + r.savings, 0),
      deals: recs.length,
      avgPct: recs.length ? recs.reduce((s, r) => s + r.savingsPct, 0) / recs.length : 0,
    };
  }).filter((v) => v.deals > 0).sort((a, b) => b.savings - a.savings);

  const totalYearlySavings = chartData.reduce((s, m) => s + m.savings, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Procurement Cost Savings Tracker" description="Monitor savings vs budgets across RFQs, vendors, and time periods." />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Savings", value: formatINR(totalSavings), icon: PiggyBank, color: "text-success", sub: "vs budget" },
          { label: "Avg Savings %", value: `${avgPct.toFixed(1)}%`, icon: TrendingUp, color: "text-primary", sub: "per RFQ" },
          { label: "Annual Savings", value: formatINR(totalYearlySavings), icon: BarChart2, color: "text-warning", sub: "FY 2025-26" },
          { label: "Best RFQ Saving", value: bestRFQ ? formatINR(bestRFQ.savings) : "—", icon: Target, color: "text-primary", sub: bestRFQ?.rfqCode ?? "" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <Card key={label} className="hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-1">
                <div className={`rounded-lg p-2 bg-muted ${color}`}><Icon className="h-4 w-4" /></div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
              <div className="text-xl font-bold mt-1">{value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Budget vs Actual Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monthly Budget vs Actual Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip
                  formatter={(v: number, name: string) => [formatINR(v), name === "budget" ? "Budget" : name === "actual" ? "Actual" : "Savings"]}
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                />
                <Legend formatter={(v) => v === "budget" ? "Budget" : v === "actual" ? "Actual Spend" : "Savings"} />
                <Bar dataKey="budget" fill="var(--color-muted)" radius={[3, 3, 0, 0]} name="budget" />
                <Bar dataKey="actual" fill="var(--color-primary)" radius={[3, 3, 0, 0]} name="actual" />
                <Bar dataKey="savings" fill="var(--color-success)" radius={[3, 3, 0, 0]} name="savings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Per-RFQ Savings Records */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Savings by RFQ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="pb-2 text-left font-medium">RFQ</th>
                  <th className="pb-2 text-left font-medium">Month</th>
                  <th className="pb-2 text-right font-medium">Budget</th>
                  <th className="pb-2 text-right font-medium">Actual Cost</th>
                  <th className="pb-2 text-right font-medium">Savings</th>
                  <th className="pb-2 text-right font-medium">Savings %</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {savings.map((rec) => (
                  <tr key={rec.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 font-mono text-xs text-muted-foreground">{rec.rfqCode}</td>
                    <td className="py-2.5">{rec.month}</td>
                    <td className="py-2.5 text-right font-mono text-xs">{formatINR(rec.rfqBudget)}</td>
                    <td className="py-2.5 text-right font-mono text-xs">{formatINR(rec.approvedCost)}</td>
                    <td className="py-2.5 text-right font-semibold text-success">{formatINR(rec.savings)}</td>
                    <td className="py-2.5 text-right">
                      <Badge className={`text-[10px] border ${rec.savingsPct >= 15 ? "bg-success/15 text-success border-success/30" : rec.savingsPct >= 10 ? "bg-primary/15 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"}`}>
                        {rec.savingsPct.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <td className="pt-3 text-sm" colSpan={2}>Total</td>
                  <td className="pt-3 text-right font-mono text-sm">{formatINR(totalBudget)}</td>
                  <td className="pt-3 text-right font-mono text-sm">{formatINR(totalBudget - totalSavings)}</td>
                  <td className="pt-3 text-right text-success font-mono text-sm">{formatINR(totalSavings)}</td>
                  <td className="pt-3 text-right">
                    <Badge className="bg-success/15 text-success border border-success/30 text-[10px]">{avgPct.toFixed(1)}% avg</Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Vendor-wise Savings */}
      {vendorSavings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vendor-wise Savings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendorSavings.map((v) => {
                const pct = totalSavings > 0 ? (v.savings / totalSavings) * 100 : 0;
                return (
                  <div key={v.vendor}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">{v.vendor}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{v.deals} deal(s)</span>
                        <span className="text-sm font-semibold text-success">{formatINR(v.savings)}</span>
                        <span className="text-xs text-muted-foreground">({v.avgPct.toFixed(1)}% avg)</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
