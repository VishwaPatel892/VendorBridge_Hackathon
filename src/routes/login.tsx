import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Boxes, ShieldCheck, ShoppingCart, Building2, UserCog } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — VendorBridge" }] }),
  component: LoginPage,
});

const roleCards: { role: Role; icon: typeof Boxes; desc: string }[] = [
  { role: "Admin", icon: UserCog, desc: "Manage users, vendors, analytics" },
  { role: "Procurement Officer", icon: ShoppingCart, desc: "RFQs, quotations, POs, invoices" },
  { role: "Manager", icon: ShieldCheck, desc: "Approve & monitor workflows" },
  { role: "Vendor", icon: Building2, desc: "Submit quotations, track POs" },
];

export default function LoginPage() {
  const { login } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Procurement Officer");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Email and password required"); return; }
    login(email, role);
    toast.success(`Signed in as ${role}`);
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-xl font-semibold">VendorBridge</div>
            <div className="text-xs uppercase tracking-widest text-sidebar-foreground/60">Procurement ERP</div>
          </div>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight">
            Run procurement<br />like a finely<br />tuned supply chain.
          </h2>
          <p className="mt-4 text-sidebar-foreground/70">
            Vendors, RFQs, quotations, approvals, POs and invoices — one workspace, full audit trail, AI-assisted vendor selection.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-sidebar-foreground/80">
            <li>• Side-by-side quotation comparison</li>
            <li>• Multi-stage approval workflows</li>
            <li>• Auto-generated POs and tax-ready invoices</li>
            <li>• Real-time activity & spend analytics</li>
          </ul>
        </div>
        <div className="text-xs text-sidebar-foreground/50">© {new Date().getFullYear()} VendorBridge</div>
        <div className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Boxes className="h-5 w-5" /></div>
            <div className="font-display text-lg font-semibold">VendorBridge</div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>Continue to your procurement workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="pw">Password</Label>
                  <Input id="pw" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div>
                  <Label>Sign in as</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {roleCards.map((rc) => {
                      const active = role === rc.role;
                      return (
                        <button
                          type="button"
                          key={rc.role}
                          onClick={() => setRole(rc.role)}
                          className={`flex items-start gap-2 rounded-lg border p-3 text-left transition ${active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted"}`}
                        >
                          <rc.icon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="min-w-0">
                            <div className="text-sm font-medium leading-tight">{rc.role}</div>
                            <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{rc.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Button type="submit" className="w-full">Sign in</Button>
                <p className="text-center text-xs text-muted-foreground">
                  Demo mode — any email/password works. Pick a role to explore that experience.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
