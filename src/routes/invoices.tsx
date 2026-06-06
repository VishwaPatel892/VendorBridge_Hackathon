import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { formatINR, useStore } from "@/lib/store";
import { format } from "date-fns";
import { Eye } from "lucide-react";

export const Route = createFileRoute("/invoices")({
  head: () => ({ meta: [{ title: "Invoices — VendorBridge" }] }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const { invoices, vendors, user } = useStore();
  let list = invoices;
  if (user?.role === "Vendor" && user.vendorId) list = list.filter((i) => i.vendorId === user.vendorId);

  const { location } = useRouterState();
  const isDetailView = /^\/invoices\/.+/.test(location.pathname);
  if (isDetailView) return <Outlet />;

  return (
    <div>
      <PageHeader title="Invoices" description="Generate, send and track invoices." />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((i) => {
                  const v = vendors.find((x) => x.id === i.vendorId);
                  return (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.code}</TableCell>
                      <TableCell>{v?.company}</TableCell>
                      <TableCell>{formatINR(i.subtotal)}</TableCell>
                      <TableCell>{formatINR(i.tax)} <span className="text-xs text-muted-foreground">({i.taxRate}%)</span></TableCell>
                      <TableCell className="font-semibold">{formatINR(i.total)}</TableCell>
                      <TableCell>{format(new Date(i.dueDate), "dd MMM yyyy")}</TableCell>
                      <TableCell><StatusBadge status={i.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="ghost"><Link to="/invoices/$id" params={{ id: i.id }}><Eye className="mr-1 h-4 w-4" /> View</Link></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {list.length === 0 && <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No invoices yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
