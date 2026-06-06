import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Building2, FileText, Quote, GitCompare, ShieldCheck,
  ShoppingCart, Receipt, BarChart3, Bell, UserCircle, LogOut, Boxes,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface NavItem { title: string; url: string; icon: typeof LayoutDashboard; roles: Role[] }

const NAV: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["Admin", "Procurement Officer", "Vendor", "Manager"] },
  { title: "Vendors", url: "/vendors", icon: Building2, roles: ["Admin", "Procurement Officer", "Manager"] },
  { title: "RFQs", url: "/rfqs", icon: FileText, roles: ["Admin", "Procurement Officer", "Vendor", "Manager"] },
  { title: "Quotations", url: "/quotations", icon: Quote, roles: ["Admin", "Procurement Officer", "Vendor"] },
  { title: "Approvals", url: "/approvals", icon: ShieldCheck, roles: ["Admin", "Manager"] },
  { title: "Purchase Orders", url: "/purchase-orders", icon: ShoppingCart, roles: ["Admin", "Procurement Officer", "Vendor", "Manager"] },
  { title: "Invoices", url: "/invoices", icon: Receipt, roles: ["Admin", "Procurement Officer", "Vendor"] },
  { title: "Reports", url: "/reports", icon: BarChart3, roles: ["Admin", "Manager"] },
  { title: "Notifications", url: "/notifications", icon: Bell, roles: ["Admin", "Procurement Officer", "Vendor", "Manager"] },
  { title: "Profile", url: "/profile", icon: UserCircle, roles: ["Admin", "Procurement Officer", "Vendor", "Manager"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout, notifications } = useStore();
  const unread = notifications.filter((n) => !n.read).length;
  const items = NAV.filter((i) => !user || i.roles.includes(user.role));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Boxes className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display text-base font-semibold text-sidebar-foreground">VendorBridge</div>
              <div className="text-[11px] uppercase tracking-wider text-sidebar-foreground/60">Procurement ERP</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="flex-1">{item.title}</span>}
                        {!collapsed && item.url === "/notifications" && unread > 0 && (
                          <span className="ml-auto rounded-full bg-primary-glow px-1.5 text-[10px] font-semibold text-sidebar-primary-foreground">
                            {unread}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {user && !collapsed && (
          <div className="px-2 py-2">
            <div className="text-sm font-medium text-sidebar-foreground">{user.name}</div>
            <div className="text-xs text-sidebar-foreground/60">{user.role}</div>
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={logout}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        )}
        {user && collapsed && (
          <Button variant="ghost" size="icon" className="mx-auto text-sidebar-foreground hover:bg-sidebar-accent" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
