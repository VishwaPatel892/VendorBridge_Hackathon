import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { formatINR, useStore } from "@/lib/store";
import { format } from "date-fns";

export const Route = createFileRoute("/quotations")({
  head: () => ({ meta: [{ title: "Quotations — VendorBridge" }] }),
  component: QuotationsPage,
});

function QuotationsPage() {
  const { quotations, vendors, rfqs, user } = useStore();
  let list = quotations;
  if (user?.role === "Vendor" && user.vendorId) list = list.filter((q) => q.vendorId === user.vendorId);

  return (
    <div>
      <PageHeader title="Quotations" description={user?.role === "Vendor" ? "Quotations you have submitted." : "All quotations across active RFQs."} />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RFQ</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((q) => {
                  const rfq = rfqs.find((r) => r.id === q.rfqId);
                  const vendor = vendors.find((v) => v.id === q.vendorId);
                  return (
                    <TableRow key={q.id}>
                      <TableCell>
                        {rfq ? <Link to="/rfqs/$id" params={{ id: rfq.id }} className="font-medium hover:underline">{rfq.code}</Link> : "—"}
                        <div className="text-xs text-muted-foreground">{rfq?.title}</div>
                      </TableCell>
                      <TableCell>{vendor?.company}</TableCell>
                      <TableCell className="font-semibold">{formatINR(q.price)}</TableCell>
                      <TableCell>{q.deliveryDays} days</TableCell>
                      <TableCell>{format(new Date(q.submittedAt), "dd MMM yyyy")}</TableCell>
                      <TableCell><StatusBadge status={q.status} /></TableCell>
                    </TableRow>
                  );
                })}
                {list.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No quotations yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
