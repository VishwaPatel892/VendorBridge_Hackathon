import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider, useStore } from "@/lib/store";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import LoginPage from "@/routes/login";

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
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="no-print sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-card/80 px-3 backdrop-blur">
            <SidebarTrigger />
            <div className="ml-2 hidden text-sm text-muted-foreground sm:block">
              Welcome back, <span className="font-medium text-foreground">{user.name}</span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/notifications" className="relative">
                  <Bell className="h-4 w-4" />
                  {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary-glow" />}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
