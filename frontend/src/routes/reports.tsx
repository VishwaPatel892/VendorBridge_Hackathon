import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR, useStore } from "@/lib/store";
import { monthlySpending, procurementTrend } from "@/lib/mock-data";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — VendorBridge" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { vendors, invoices, pos, rfqs } = useStore();

  const byCategory = Object.entries(
    vendors.reduce<Record<string, number>>((acc, v) => { acc[v.category] = (acc[v.category] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const palette = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

  const vendorPerformance = vendors.slice(0, 6).map((v) => ({
    name: v.company.split(" ")[0],
    rating: v.rating,
    pos: pos.filter((p) => p.vendorId === v.id).length,
  }));

  const exportCSV = () => {
    const rows = [["Vendor", "Category", "Rating", "Status"], ...vendors.map((v) => [v.company, v.category, v.rating, v.status])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "vendors.csv"; a.click();
    URL.revokeObjectURL(url); toast.success("CSV exported");
  };

  return (
    <div>
      <PageHeader
        title="Reports & analytics"
        description="Vendor performance, spend, procurement trends and cost savings."
        actions={<Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Monthly spending</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="spend" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vendors by category</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                    {byCategory.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Procurement trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={procurementTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="rfqs" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pos" fill="var(--color-primary-glow)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vendor performance</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="var(--color-muted-foreground)" fontSize={12} width={70} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Bar dataKey="rating" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <Kpi label="Total invoiced" v={formatINR(invoices.reduce((s, i) => s + i.total, 0))} />
          <Kpi label="POs issued" v={pos.length} />
          <Kpi label="RFQs active" v={rfqs.filter((r) => r.status === "Open").length} />
          <Kpi label="Avg vendor rating" v={(vendors.reduce((s, v) => s + v.rating, 0) / Math.max(vendors.length, 1)).toFixed(2)} />
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, v }: { label: string; v: string | number }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{v}</div>
    </div>
  );
}
