import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider, useStore } from "@/lib/store";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Bell, CheckCheck, BellOff, FileText, Quote, ShieldCheck, Receipt, ShoppingCart, Activity } from "lucide-react";
import { Link } from "@tanstack/react-router";
import LoginPage from "@/routes/login";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatAssistant } from "@/components/chat-assistant";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => { router.invalidate(); reset(); }}>Try again</Button>
          <Button variant="outline" asChild><a href="/">Go home</a></Button>
        </div>
      </div>
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <Button asChild className="mt-6"><Link to="/">Back to dashboard</Link></Button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VendorBridge — Procurement & Vendor Management ERP" },
      { name: "description", content: "End-to-end procurement: vendors, RFQs, quotations, approvals, POs, invoices, and analytics." },
      { property: "og:title", content: "VendorBridge — Procurement & Vendor Management ERP" },
      { name: "twitter:title", content: "VendorBridge — Procurement & Vendor Management ERP" },
      { property: "og:description", content: "End-to-end procurement: vendors, RFQs, quotations, approvals, POs, invoices, and analytics." },
      { name: "twitter:description", content: "End-to-end procurement: vendors, RFQs, quotations, approvals, POs, invoices, and analytics." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d141c24c-21f7-40bd-88cb-be0cfcdd6e64/id-preview-3658616d--9e703842-5048-4755-84a5-3dcb7709af49.lovable.app-1780717565144.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d141c24c-21f7-40bd-88cb-be0cfcdd6e64/id-preview-3658616d--9e703842-5048-4755-84a5-3dcb7709af49.lovable.app-1780717565144.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <AppShell />
        <Toaster position="top-right" richColors />
      </StoreProvider>
    </QueryClientProvider>
  );
}

const nIcons: Record<string, typeof FileText> = {
  rfq: FileText,
  quotation: Quote,
  approval: ShieldCheck,
  invoice: Receipt,
  po: ShoppingCart,
};

const nColors: Record<string, string> = {
  rfq: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  quotation: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  approval: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  invoice: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  po: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

function AppShell() {
  const { user, theme, setTheme, notifications, markNotificationRead, markAllNotificationsRead } = useStore();
  if (!user) return <LoginPage />;
  const unread = notifications.filter((n) => !n.read).length;
  const initials = user.name.split(" ").map((s) => s[0]).join("").slice(0, 2);
  const recentNotifications = notifications.slice(0, 6);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="no-print sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-card/80 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-2 md:hidden" />
            <div className="hidden text-sm text-muted-foreground sm:block">
              Welcome back, <span className="font-medium text-foreground">{user.name}</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              {/* Slide-out Quick Notification Panel */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative cursor-pointer">
                    <Bell className="h-4 w-4" />
                    {unread > 0 && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-glow px-1 text-[10px] font-bold text-sidebar-primary-foreground animate-pulse">
                        {unread}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[350px] sm:w-[400px] flex flex-col p-0 overflow-hidden">
                  <div className="p-5 border-b bg-muted/20">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2 text-base font-semibold">
                        <Bell className="h-4.5 w-4.5 text-primary" /> Recent Alerts
                        {unread > 0 && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary font-bold">
                            {unread} new
                          </span>
                        )}
                      </SheetTitle>
                      <SheetDescription className="text-xs">
                        Audit trail and real-time process notifications.
                      </SheetDescription>
                    </SheetHeader>
                    {unread > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-3 h-8 text-[11px] gap-1.5 text-primary w-full justify-center hover:bg-primary/5 cursor-pointer" 
                        onClick={() => {
                          markAllNotificationsRead();
                          toast.success("All notifications read");
                        }}
                      >
                        <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
                      </Button>
                    )}
                  </div>

                  {/* Notification items */}
                  <div className="flex-1 overflow-y-auto divide-y divide-muted/30">
                    {recentNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                        <BellOff className="h-8 w-8 opacity-45" />
                        <span className="text-xs font-medium">All caught up!</span>
                      </div>
                    ) : (
                      recentNotifications.map((n) => {
                        const Icon = nIcons[n.type] || Bell;
                        const col = nColors[n.type] || "bg-muted text-muted-foreground";
                        return (
                          <div 
                            key={n.id} 
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-4 flex gap-3 text-xs hover:bg-muted/30 transition-colors cursor-pointer relative ${!n.read ? "bg-primary/5" : ""}`}
                          >
                            {!n.read && (
                              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                            <div className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center border shadow-sm ${col}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="space-y-1 min-w-0">
                              <p className={`leading-normal ${!n.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                                {n.message}
                              </p>
                              <p className="text-[10px] text-muted-foreground/85">
                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-4 border-t bg-muted/20">
                    <Button asChild className="w-full text-xs" variant="outline">
                      <Link to="/notifications">
                        <Activity className="mr-1.5 h-3.5 w-3.5" /> View Notification Center
                      </Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Link to="/profile" className="ml-1">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary/50">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
        </div>
      </div>
      <ChatAssistant />
    </SidebarProvider>
  );
}
