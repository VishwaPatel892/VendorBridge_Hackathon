import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { formatINR, useStore } from "@/lib/store";
import { format } from "date-fns";
import { FileDown, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/purchase-orders")({
  head: () => ({ meta: [{ title: "Purchase Orders — VendorBridge" }] }),
  component: POPage,
});

function POPage() {
  const { pos, vendors, rfqs, user, createInvoiceFromPO } = useStore();
  const navigate = useNavigate();
  let list = pos;
  if (user?.role === "Vendor" && user.vendorId) list = list.filter((p) => p.vendorId === user.vendorId);

  const generateInvoice = (poId: string) => {
    const inv = createInvoiceFromPO(poId);
    if (inv) { toast.success(`${inv.code} created`); navigate({ to: "/invoices/$id", params: { id: inv.id } }); }
  };

  return (
    <div>
      <PageHeader title="Purchase Orders" description="POs issued from awarded quotations." />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>RFQ</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => {
                  const v = vendors.find((x) => x.id === p.vendorId);
                  const r = rfqs.find((x) => x.id === p.rfqId);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.code}</TableCell>
                      <TableCell>{v?.company}</TableCell>
                      <TableCell>{r?.code}</TableCell>
                      <TableCell className="font-semibold">{formatINR(p.totalAmount)}</TableCell>
                      <TableCell>{format(new Date(p.createdAt), "dd MMM yyyy")}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => window.print()}><FileDown className="mr-1 h-4 w-4" /> PDF</Button>
                        {user?.role !== "Vendor" && (
                          <Button size="sm" onClick={() => generateInvoice(p.id)}><Receipt className="mr-1 h-4 w-4" /> Invoice</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {list.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No purchase orders yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
