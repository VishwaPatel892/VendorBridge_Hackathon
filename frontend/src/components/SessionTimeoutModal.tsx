import { Clock } from 'lucide-react';

interface SessionTimeoutModalProps {
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export default function SessionTimeoutModal({ onStayLoggedIn, onLogout }: SessionTimeoutModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fade-in">
      <div className="bg-card rounded-lg border border-border max-w-sm w-full p-6 text-center shadow-xl">
        <div className="mx-auto w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
          <Clock className="h-6 w-6 text-warning" />
        </div>
        <h2 className="text-sm font-bold text-foreground">Session Expiring Soon</h2>
        <p className="text-xs text-muted-foreground mt-2">
          Your session will expire in 2 minutes due to inactivity.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onLogout}
            className="flex-1 px-3 py-2 rounded-md border border-border text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
          >
            Logout
          </button>
          <button
            onClick={onStayLoggedIn}
            className="flex-1 px-3 py-2 rounded-md bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}
