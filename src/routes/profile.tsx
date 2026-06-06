import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — VendorBridge" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, activity } = useStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  return (
    <div>
      <PageHeader title="Your profile" description="Account information and recent activity." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16"><AvatarFallback className="bg-primary text-primary-foreground text-lg">{user?.name.split(" ").map((s) => s[0]).join("")}</AvatarFallback></Avatar>
              <div>
                <div className="text-lg font-semibold">{user?.name}</div>
                <div className="text-sm text-muted-foreground">{user?.role}</div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Role</Label><Input value={user?.role || ""} disabled /></div>
            </div>
            <Button onClick={() => toast.success("Profile updated (demo)")}>Save changes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Your activity</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {activity.filter((a) => a.user === user?.name).slice(0, 8).map((a) => (
              <div key={a.id} className="border-b pb-2 last:border-0">
                <div>{a.action}</div>
                <div className="text-xs text-muted-foreground">{a.module}</div>
              </div>
            ))}
            {activity.filter((a) => a.user === user?.name).length === 0 && <div className="text-muted-foreground">No activity yet.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
