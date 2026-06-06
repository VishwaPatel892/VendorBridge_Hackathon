import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, FileText, ShieldCheck, ShoppingCart, Receipt, TrendingUp, Activity } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR, useStore } from "@/lib/store";
import { monthlySpending, procurementTrend } from "@/lib/mock-data";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { StatusBadge } from "@/components/status-badge";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — VendorBridge" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { vendors, rfqs, approvals, pos, invoices, activity, user } = useStore();
  const activeRFQs = rfqs.filter((r) => r.status === "Open").length;
  const pendingApprovals = approvals.filter((a) => a.status === "Pending").length;
  const monthlySpend = invoices.reduce((s, i) => s + i.total, 0);
  const procurementValue = pos.reduce((s, p) => s + p.totalAmount, 0);

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user?.name.split(" ")[0]}`}
        description="Snapshot of vendors, procurement and spend across your organization."
        actions={
          <>
            <Button variant="outline" asChild><Link to="/rfqs">View RFQs</Link></Button>
            <Button asChild><Link to="/vendors">Add Vendor</Link></Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        <StatCard label="Vendors" value={vendors.length} icon={Building2} trend={`${vendors.filter(v => v.status === "Active").length} active`} />
        <StatCard label="Active RFQs" value={activeRFQs} icon={FileText} accent="primary" />
        <StatCard label="Pending Approvals" value={pendingApprovals} icon={ShieldCheck} accent="warning" />
        <StatCard label="Purchase Orders" value={pos.length} icon={ShoppingCart} accent="success" />
        <StatCard label="Invoices" value={invoices.length} icon={Receipt} />
        <StatCard label="Procurement Value" value={formatINR(procurementValue)} icon={TrendingUp} accent="success" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly spending</CardTitle>
            <p className="text-sm text-muted-foreground">Last 6 months · {formatINR(monthlySpend)} this month</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySpending}>
                  <defs>
                    <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary-glow)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="var(--color-primary-glow)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v: number) => formatINR(v)}
                    contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
                  />
                  <Area type="monotone" dataKey="spend" stroke="var(--color-primary)" strokeWidth={2} fill="url(#spend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Procurement trend</CardTitle><p className="text-sm text-muted-foreground">RFQs vs POs</p></CardHeader>
          <CardContent>
            <div className="h-64">
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
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent RFQs</CardTitle></CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {rfqs.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between px-6 py-3">
                  <div className="min-w-0">
                    <Link to="/rfqs/$id" params={{ id: r.id }} className="font-medium hover:underline">{r.code}</Link>
                    <div className="truncate text-sm text-muted-foreground">{r.title}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" /> Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {activity.slice(0, 6).map((a) => (
                <li key={a.id} className="px-6 py-3 text-sm">
                  <div>{a.action}</div>
                  <div className="text-xs text-muted-foreground">{a.user} · {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Action Buttons ── */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="lg" className="w-full sm:w-auto min-w-[160px]"><Link to="/rfqs">New RFQ's</Link></Button>
        <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto min-w-[160px]"><Link to="/vendors">Add Vendors</Link></Button>
        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto min-w-[160px]"><Link to="/invoices">View Invoices</Link></Button>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
