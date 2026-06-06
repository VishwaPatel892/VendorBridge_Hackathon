import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { toast } from "sonner";
import {
  Boxes, Mail, Eye, EyeOff, Lock, UserCog, ShoppingCart, ShieldCheck, Building2,
  BrainCircuit, LayoutTemplate, GitMerge, LineChart, Users, Clock, FileText, CheckCircle2, Shield
} from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — VendorBridge" }] }),
  component: LoginPage,
});

const ROLES: { id: Role; title: string; desc: string; icon: React.ElementType }[] = [
  { id: "Admin", title: "Admin", desc: "Manage users, vendors, analytics", icon: UserCog },
  { id: "Procurement Officer", title: "Procurement", desc: "RFQs, quotations, POs, invoices", icon: ShoppingCart },
  { id: "Manager", title: "Manager", desc: "Approve & monitor workflows", icon: ShieldCheck },
  { id: "Vendor", title: "Vendor", desc: "Submit quotations, track POs", icon: Building2 },
];

export default function LoginPage() {
  const { login } = useStore();
  const [screen, setScreen] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("you@company.com");
  const [password, setPassword] = useState("••••••••");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<Role>("Admin");

  // Registration state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email === "you@company.com" ? "admin@vendorbridge.com" : email, role);
    toast.success(`Signed in as ${role}`);
  };

  const onRegister = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    toast.success("Account created successfully");
  };

  return (
    <div className="min-h-screen flex bg-[#031518] font-sans text-slate-100 overflow-hidden">
      
      {/* ════════ LEFT PANEL — Dark Branding ════════ */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between relative px-10 py-8 overflow-hidden max-h-screen">
        
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <img src="/vendorbridge-hero.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#031518] via-[#031518]/90 to-transparent" />
          <div className="absolute top-[20%] left-[10%] w-80 h-80 bg-teal-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 shrink-0">
            <Boxes className="h-5 w-5 text-[#031518]" />
          </div>
          <div>
            <div className="text-white text-xl font-semibold tracking-tight leading-none">VendorBridge</div>
            <div className="text-teal-500 text-[9px] tracking-widest font-semibold uppercase mt-0.5">Procurement ERP</div>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-xl mt-6">
          <h1 className="text-[2.75rem] font-bold leading-[1.1] tracking-tight mb-4 text-white">
            Run procurement <br />
            like a <span className="text-teal-400">finely<br/>tuned supply chain.</span>
          </h1>
          
          <p className="text-slate-300/80 text-base leading-relaxed mb-6 max-w-md">
            Vendors, RFQs, quotations, approvals, POs and invoices — one workspace, full audit trail.
          </p>

          <ul className="space-y-3.5">
            {[
              { icon: BrainCircuit, text: "AI-powered vendor recommendations" },
              { icon: LayoutTemplate, text: "Side-by-side quotation comparison" },
              { icon: GitMerge, text: "Multi-stage approval workflows" },
              { icon: LineChart, text: "Real-time activity & spend analytics" },
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 shrink-0">
                  <feature.icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <span className="text-slate-200 text-sm font-medium">{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Stats Row */}
        <div className="relative z-10 mt-auto pt-6">
          <div className="flex flex-wrap gap-6 sm:gap-8 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-1.5 text-teal-400 mb-0.5">
                <Users className="h-4 w-4" />
                <span className="text-xl font-bold text-white">2000+</span>
              </div>
              <div className="text-xs text-slate-400 font-medium">Active Vendors</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-teal-400 mb-0.5">
                <Clock className="h-4 w-4" />
                <span className="text-xl font-bold text-white">98%</span>
              </div>
              <div className="text-xs text-slate-400 font-medium">On-Time Delivery</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-teal-400 mb-0.5">
                <div className="flex h-4 w-4 items-center justify-center rounded-full border border-teal-400 text-[10px]">₹</div>
                <span className="text-xl font-bold text-white">12M</span>
              </div>
              <div className="text-xs text-slate-400 font-medium">Procurement Savings</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-teal-400 mb-0.5">
                <FileText className="h-4 w-4" />
                <span className="text-xl font-bold text-white">50K+</span>
              </div>
              <div className="text-xs text-slate-400 font-medium">RFQs Processed</div>
            </div>
          </div>
          <div className="pt-4 text-[11px] text-slate-500 font-medium">
            © {new Date().getFullYear()} VendorBridge. All rights reserved.
          </div>
        </div>
      </div>


      {/* ════════ RIGHT PANEL — Light Form ════════ */}
      <div className="flex-1 bg-white lg:rounded-l-[2rem] flex flex-col justify-center items-center p-4 relative overflow-hidden h-screen">
        
        <div className="w-full max-w-[480px] text-slate-900 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
          
          {screen === "login" ? (
            <div className="py-2">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
                <p className="text-slate-500 text-[13px]">Continue to your procurement workspace.</p>
              </div>

              <form onSubmit={onLogin} className="space-y-4">
                
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[13px] font-semibold text-slate-900">Email address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors bg-white"
                      required
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[13px] font-semibold text-slate-900">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors bg-white"
                      required
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end -mt-1">
                  <a href="#" className="text-xs font-semibold text-teal-700 hover:text-teal-800">Forgot password?</a>
                </div>

                {/* Role Selection Grid */}
                <div className="pt-1">
                  <label className="text-[13px] font-semibold text-slate-900 block mb-2">Sign in as</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ROLES.map((r) => {
                      const isActive = role === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => setRole(r.id)}
                          className={`relative cursor-pointer rounded-xl border p-3 transition-all ${
                            isActive 
                              ? "border-teal-600 bg-teal-50/50 shadow-sm" 
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          {isActive && (
                            <div className="absolute top-3 right-3 h-4 w-4 bg-teal-600 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />
                            </div>
                          )}
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg mb-2 ${isActive ? "bg-white shadow-sm" : "bg-slate-100"}`}>
                            <r.icon className={`h-4 w-4 ${isActive ? "text-teal-600" : "text-slate-600"}`} />
                          </div>
                          <div className="font-semibold text-slate-900 text-[13px] mb-0.5">{r.title}</div>
                          <div className="text-[11px] text-slate-500 leading-snug pr-2 line-clamp-1">{r.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-600" />
                    <span className="text-[13px] text-slate-500">Remember me</span>
                  </label>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="text-[13px] font-medium">Secure Login</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-[#0a4d4a] hover:bg-[#083b39] text-white text-sm font-semibold transition-colors mt-2"
                >
                  <Lock className="h-3.5 w-3.5" /> Sign in
                </button>
              </form>

              <div className="mt-5 text-center pt-4 border-t border-slate-100">
                <span className="text-[13px] text-slate-500">New to VendorBridge? </span>
                <button onClick={() => setScreen("register")} className="text-[13px] font-semibold text-teal-700 hover:text-teal-800">
                  Sign up
                </button>
              </div>
            </div>
          ) : (
            <div className="py-2">
              {/* REGISTER SCREEN (MATCHING STYLES) */}
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
                <p className="text-slate-500 text-[13px]">Join the procurement workspace.</p>
              </div>

              <form onSubmit={onRegister} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[13px] font-semibold text-slate-900">First Name</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors bg-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[13px] font-semibold text-slate-900">Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors bg-white" required />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[13px] font-semibold text-slate-900">Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors bg-white" required />
                </div>

                <div className="space-y-1">
                  <label className="text-[13px] font-semibold text-slate-900">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors bg-white" required />
                </div>

                {/* Role Selection Grid */}
                <div className="pt-1">
                  <label className="text-[13px] font-semibold text-slate-900 block mb-2">I am a...</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ROLES.map((r) => {
                      const isActive = role === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => setRole(r.id)}
                          className={`relative cursor-pointer rounded-xl border p-3 transition-all ${
                            isActive ? "border-teal-600 bg-teal-50/50 shadow-sm" : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          {isActive && (
                            <div className="absolute top-3 right-3 h-4 w-4 bg-teal-600 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />
                            </div>
                          )}
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg mb-2 ${isActive ? "bg-white shadow-sm" : "bg-slate-100"}`}>
                            <r.icon className={`h-4 w-4 ${isActive ? "text-teal-600" : "text-slate-600"}`} />
                          </div>
                          <div className="font-semibold text-slate-900 text-[13px] mb-0.5">{r.title}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-[#0a4d4a] hover:bg-[#083b39] text-white text-sm font-semibold transition-colors mt-2">
                  Create Account
                </button>
              </form>

              <div className="mt-5 text-center pt-4 border-t border-slate-100">
                <span className="text-[13px] text-slate-500">Already have an account? </span>
                <button onClick={() => setScreen("login")} className="text-[13px] font-semibold text-teal-700 hover:text-teal-800">
                  Sign in
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
