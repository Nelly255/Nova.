"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Activity, ArrowLeft, Mail, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function ForgotPassword() {
  const [theme, setTheme] = useState('dark');
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 🚀 PATCHED: Bulletproof 3-way theme detector
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('app_theme');
      let isDark = false;
      
      if (savedTheme === 'dark') {
        isDark = true;
      } else if (savedTheme === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setTheme(isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Supabase magically handles sending the email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // This tells Supabase where to send the user AFTER they click the link in their email
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("We've sent a password reset link to your email. Please check your inbox (and spam folder)!");
      setEmail(""); // Clear the input on success
    }
    
    setIsLoading(false);
  };

  return (
    <main className={`min-h-screen bg-slate-50 dark:bg-[#0A0A0E] text-slate-900 dark:text-slate-50 flex flex-col relative overflow-hidden selection:bg-brand-500/30 transition-colors duration-500 ${bodyFont.className}`}>
      
      {/* Premium Background Blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-600/10 dark:bg-brand-600/20 rounded-full blur-[120px] pointer-events-none opacity-60"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="w-full max-w-7xl mx-auto px-6 pt-8 pb-4 flex justify-between items-center z-50 relative">
        <Link href="/" className="flex items-center gap-2 group">
          <Activity size={28} className="text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform" />
          <span className={`${headerFont.className} font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white`}>
            Nova.
          </span>
        </Link>
        <Link href="/login" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft size={16} /> <span>Back to Login</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          <div className="text-center mb-8">
            <h1 className={`${headerFont.className} text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight`}>Reset Password</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Enter your email and we'll send you a link to reset your password.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-snug">{errorMsg}</p>
            </div>
          )}

          {successMsg ? (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                {successMsg}
              </p>
              <Link 
                href="/login"
                className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading || !email}
                className="w-full flex justify-center items-center gap-2 bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5 active:scale-95 transition-all mt-6 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Send Reset Link"}
              </button>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}