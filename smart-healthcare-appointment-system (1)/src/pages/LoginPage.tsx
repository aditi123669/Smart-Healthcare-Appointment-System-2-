import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, LogIn, Lock, Mail, ChevronRight, Stethoscope } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { UserRole } from "@/src/types";
import { googleSignIn } from "../lib/workspace";

export default function LoginPage({ login }: { login: (user: any) => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation
    login({
      id: Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0] || "User",
      email,
      role
    });
    navigate("/dashboard");
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        login({
          id: result.user.uid,
          name: result.user.displayName || result.user.email?.split("@")[0] || "User",
          email: result.user.email || "",
          role: "patient"
        });
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.warn("Google Workspace Sign-in skipped/interrupted:", err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-soft border border-slate-100 p-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500">Log in to manage your health journey</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button
              type="button"
              onClick={() => setRole("patient")}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                role === "patient" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole("doctor")}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                role === "doctor" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                role === "admin" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Admin
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group cursor-pointer"
          >
            Log In
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="relative flex items-center justify-center my-4 shrink-0">
            <hr className="w-full border-slate-200" />
            <span className="absolute bg-white px-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none">or continue with</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-4 h-4 p-0.5 shrink-0">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
            </div>
            <span>Sign in with Google Workspace</span>
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 pt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-bold hover:underline">Create one</Link>
        </div>
      </motion.div>
    </div>
  );
}
