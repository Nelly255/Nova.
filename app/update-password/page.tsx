"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Activity, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function UpdatePassword() {
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sync theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    if (savedTheme === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // 1. Check if passwords match before sending to database
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    // 2. Tell Supabase to overwrite the old password with the new one
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    } else {
      setSuccessMsg("Password updated successfully! Securing your vault...");
      
      // Give them a 2-second success feeling, then boot them to the dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  };

  return (
    <main className={`min-h-screen bg-slate-50 dark:bg-[#0A0A0E] text-slate-900 dark:text-slate-50 flex flex-col relative overflow-hidden selection:bg-indigo-500/30 transition-colors duration-500 ${bodyFont.className}`}>
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none opacity-60"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Minimal Header (No 'Back' button because they must complete this flow) */}
      <header className="w-full max-w-7xl mx-auto px-6 pt-8 pb-4 flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-2">
          <Activity size={28} className="text-indigo-600 dark:text-indigo-400" />
          <span className={`${headerFont.className} font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white`}>
            Nova.
          </span>
        </div>
      </header>

      {/* Centered Auth Card */}
      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-500/30 mb-4 text-indigo-600 dark:text-indigo-400">
              <Lock size={20} />
            </div>
            <h1 className={`${headerFont.className} text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight`}>Secure new password</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Please enter a strong password for your account.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 flex items-center gap-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-sm font-medium leading-snug">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 flex items-start gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-snug">{successMsg}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleUpdatePassword}>
            
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-11 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-11 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || successMsg !== ""}
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 active:scale-95 transition-all mt-6 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}