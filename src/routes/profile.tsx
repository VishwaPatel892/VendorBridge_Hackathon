import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";
import {
  User, Mail, Shield, Building2, Phone, MapPin, Calendar, Hash,
  Lock, KeyRound, Bell, Globe, Clock, FileText, ShoppingCart,
  Receipt, CheckCircle2, Camera, Pencil, Save, Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — VendorBridge" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, activity, rfqs, pos, invoices, notifications } = useStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [department, setDepartment] = useState("Procurement");
  const [location, setLocation] = useState("Mumbai, India");
  const [isEditing, setIsEditing] = useState(false);

  // Notification preferences state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);

  const initials = user?.name.split(" ").map((s) => s[0]).join("").slice(0, 2) || "?";
  const userActivity = activity.filter((a) => a.user === user?.name);

  // Stats
  const statsData = [
    { label: "RFQs Created", value: rfqs.filter((r) => r.createdBy === user?.id).length, icon: FileText, color: "text-blue-500" },
    { label: "POs Managed", value: pos.length, icon: ShoppingCart, color: "text-orange-500" },
    { label: "Invoices", value: invoices.length, icon: Receipt, color: "text-emerald-500" },
    { label: "Notifications", value: notifications.length, icon: Bell, color: "text-purple-500" },
  ];

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  return (
    <div>
      <PageHeader title="Your Profile" description="Manage your account, preferences, and security settings." />

      {/* Hero Banner */}
      <Card className="relative mb-6 overflow-hidden">
        {/* Gradient banner */}
        <div className="h-32 w-full bg-gradient-to-r from-primary via-primary-glow to-primary sm:h-40" />

        <CardContent className="relative px-6 pb-6">
          {/* Avatar overlapping the banner */}
          <div className="relative -mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-card shadow-lg sm:h-28 sm:w-28">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold sm:text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110 opacity-0 group-hover:opacity-100">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 pb-1">
              <h2 className="text-xl font-display font-bold text-foreground sm:text-2xl">{user?.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Shield className="h-3 w-3" />
                  {user?.role}
                </Badge>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {department}</span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {location}</span>
              </div>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              className="gap-1.5 self-start sm:self-end"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? <><Save className="h-3.5 w-3.5" /> Save Changes</> : <><Pencil className="h-3.5 w-3.5" /> Edit Profile</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-display">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Account & Security */}
        <div className="space-y-6 lg:col-span-2">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your personal and professional details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <User className="h-3 w-3" /> Full Name
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Mail className="h-3 w-3" /> Email Address
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Phone className="h-3 w-3" /> Phone Number
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Building2 className="h-3 w-3" /> Department
                  </Label>
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3 w-3" /> Location
                  </Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Shield className="h-3 w-3" /> Role
                  </Label>
                  <Input value={user?.role || ""} disabled className="disabled:opacity-70" />
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Hash className="h-3 w-3" /> Employee ID
                  </Label>
                  <Input value={user?.id.toUpperCase() || ""} disabled className="disabled:opacity-70 font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Calendar className="h-3 w-3" /> Date Joined
                  </Label>
                  <Input value="January 15, 2025" disabled className="disabled:opacity-70" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-3 w-3" /> Timezone
                  </Label>
                  <Input value="Asia/Kolkata (IST)" disabled className="disabled:opacity-70" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your password and authentication settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Password</div>
                    <div className="text-xs text-muted-foreground">Last changed 30 days ago</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("Password change dialog (demo)")}>
                  Change Password
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Two-Factor Authentication</div>
                    <div className="text-xs text-muted-foreground">Add an extra layer of security to your account</div>
                  </div>
                </div>
                <Switch
                  onCheckedChange={(checked) =>
                    toast.success(checked ? "2FA enabled (demo)" : "2FA disabled (demo)")
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Active Sessions</div>
                    <div className="text-xs text-muted-foreground">1 active session — this device</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle2 className="mr-1 h-3 w-3 text-success" />
                  Current
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preferences & Activity */}
        <div className="space-y-6">
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Notification Preferences</CardTitle>
                  <CardDescription className="text-xs">Choose how you receive alerts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Email Notifications</div>
                  <div className="text-xs text-muted-foreground">Receive alerts via email</div>
                </div>
                <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Push Notifications</div>
                  <div className="text-xs text-muted-foreground">Browser push notifications</div>
                </div>
                <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">SMS Alerts</div>
                  <div className="text-xs text-muted-foreground">Critical alerts via SMS</div>
                </div>
                <Switch checked={smsNotifs} onCheckedChange={setSmsNotifs} />
              </div>
            </CardContent>
          </Card>

          {/* Display Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Display Preferences</CardTitle>
                  <CardDescription className="text-xs">Customize your experience</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2.5">
                <span className="text-sm">Language</span>
                <span className="text-sm font-medium">English (US)</span>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2.5">
                <span className="text-sm">Currency</span>
                <span className="text-sm font-medium">INR (₹)</span>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2.5">
                <span className="text-sm">Date Format</span>
                <span className="text-sm font-medium">DD/MM/YYYY</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                  <CardDescription className="text-xs">Your latest actions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {userActivity.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3">
                  <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{a.action}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{a.module}</span>
                      <span className="text-border">•</span>
                      <span>{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))}
              {userActivity.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Activity className="mx-auto mb-2 h-6 w-6 opacity-40" />
                  <p className="text-xs">No activity yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
