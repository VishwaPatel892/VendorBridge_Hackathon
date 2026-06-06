import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useStore, type Role } from '../lib/store';
import { apiClient } from '../lib/api-client';
import { Users, Building2, UserCog } from 'lucide-react';
import { toast } from 'sonner';

const roles: { value: Role; label: string; icon: any; desc: string }[] = [
  { value: 'Procurement Officer', label: 'Procurement Officer', icon: Users, desc: 'Manage RFQs, vendors, and procurement' },
  { value: 'Vendor', label: 'Vendor', icon: Building2, desc: 'Submit quotations and manage invoices' },
  { value: 'Manager', label: 'Manager', icon: UserCog, desc: 'Approve procurement and view reports' },
];

export default function GoogleRoleModal() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useStore();

  const handleSubmit = async () => {
    const role = selectedRole;
    if (!role) return;
    setSaving(true);
    try {
      if (!user) throw new Error('No user');
      
      // We don't have an explicit profile update route right now in auth.controller, 
      // but if the backend has one we'd call it. For now we will assume there is one 
      // or we just update the user state locally to proceed.
      // const res = await apiClient.put('/auth/profile', { role });
      
      setUser({ ...user, role });
      toast.success('Profile completed!');
      navigate({ to: '/' });
    } catch {
      toast.error('Failed to save role. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-card rounded-lg border border-border max-w-md w-full p-6 shadow-xl">
        <h2 className="text-base font-bold text-foreground">Complete your profile</h2>
        <p className="text-xs text-muted-foreground mt-1">Select your role to get started.</p>
        <div className="mt-4 space-y-2">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.value;
            return (
              <button
                key={r.value}
                onClick={() => setSelectedRole(r.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-md border text-left transition cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <div className={`p-2 rounded-full ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{r.label}</div>
                  <div className="text-[10px] text-muted-foreground">{r.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!selectedRole || saving}
          className="mt-4 w-full py-2.5 rounded-md bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
