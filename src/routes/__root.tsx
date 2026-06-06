import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider, useStore } from "@/lib/store";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import LoginPage from "@/routes/login";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

function AppShell() {
  const { user, theme, setTheme, notifications } = useStore();
  if (!user) return <LoginPage />;
  const unread = notifications.filter((n) => !n.read).length;
  const initials = user.name.split(" ").map((s) => s[0]).join("").slice(0, 2);
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="no-print sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-card/80 px-4 backdrop-blur">
            <div className="hidden text-sm text-muted-foreground sm:block">
              Welcome back, <span className="font-medium text-foreground">{user.name}</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/notifications" className="relative">
                  <Bell className="h-4 w-4" />
                  {unread > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-glow px-1 text-[10px] font-bold text-sidebar-primary-foreground">
                      {unread}
                    </span>
                  )}
                </Link>
              </Button>
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
    </SidebarProvider>
  );
}
