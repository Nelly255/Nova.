"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Activity, ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

// Custom SVG Icon for Google
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LogIn() {
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [showPassword, setShowPassword] = useState(false);

  // 🚀 NEW: Stashed Email State
  const [lockedEmail, setLockedEmail] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

    // 🚀 NEW: Check for an auto-logout email stash on mount
    const stashedEmail = localStorage.getItem("nova_locked_email");
    if (stashedEmail) {
      setLockedEmail(stashedEmail);
      setEmail(stashedEmail); // Prefill the email state so handleLogin works perfectly
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      // If successful, clear the lock so it doesn't persist forever
      localStorage.removeItem("nova_locked_email");

      router.refresh();
      router.push('/dashboard');
      
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
      
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to initialize Google login.");
      setIsGoogleLoading(false);
    }
  };

  // 🚀 NEW: Function to clear the stashed email if the user wants to log in as someone else
  const handleClearLock = () => {
    localStorage.removeItem("nova_locked_email");
    setLockedEmail(null);
    setEmail("");
    setPassword("");
    setErrorMsg("");
  };

  return (
    <main className={`min-h-screen bg-slate-50 dark:bg-[#0A0A0E] text-slate-900 dark:text-slate-50 flex flex-col relative overflow-hidden selection:bg-brand-500/30 transition-colors duration-500 ${bodyFont.className}`}>
      
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-600/10 dark:bg-brand-600/20 rounded-full blur-[120px] pointer-events-none opacity-60"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="w-full max-w-7xl mx-auto px-6 pt-8 pb-4 flex justify-between items-center z-50 relative">
        <Link href="/" className="flex items-center gap-2 group">
          <Activity size={28} className="text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform" />
          <span className={`${headerFont.className} font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white`}>
            Nova.
          </span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to Home</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 z-10 py-12">
        <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          {errorMsg && (
            <div className="mb-6 flex items-center gap-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-sm font-medium leading-snug">{errorMsg}</p>
            </div>
          )}

          {/* 🚀 NEW: Conditional Rendering based on lockedEmail */}
          {lockedEmail ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center border border-brand-200 dark:border-brand-500/20 mb-4 shadow-sm">
                  <Lock size={32} className="text-brand-600 dark:text-brand-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1 uppercase tracking-widest">Session Locked</p>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">{lockedEmail}</h2>
              </div>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Password</label>
                    <Link href="/forgot-password" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                      required
                      autoFocus
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

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] hover:-translate-y-0.5 active:scale-95 transition-all mt-6 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Unlock Vault"}
                </button>
              </form>

              <div className="mt-8 text-center border-t border-slate-200 dark:border-white/10 pt-6">
                <button 
                  type="button"
                  onClick={handleClearLock} 
                  className="text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Not you? Log in as someone else
                </button>
              </div>
            </div>
          ) : (
            
            /* ORIGINAL LOGIN FORM */
            <div className="animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <h1 className={`${headerFont.className} text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight`}>Welcome back</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Log in to access your financial vault.</p>
              </div>

              <div className="mb-6">
                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full flex justify-center items-center gap-3 bg-white dark:bg-black/20 hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-70 disabled:hover:bg-white dark:disabled:hover:bg-black/20 disabled:active:scale-100"
                >
                  {isGoogleLoading ? <Loader2 className="animate-spin text-slate-400" size={20} /> : <GoogleIcon />}
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10"></div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Or</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10"></div>
              </div>

              <form className="space-y-4" onSubmit={handleLogin}>
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

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Password</label>
                    <Link href="/forgot-password" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
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

                <button 
                  type="submit" 
                  disabled={isLoading || isGoogleLoading}
                  className="w-full flex justify-center items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] hover:-translate-y-0.5 active:scale-95 transition-all mt-6 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Sign In with Email"}
                </button>
              </form>

              <p className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                Don't have an account?{" "}
                <Link href="/signup" className="font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                  Sign up here
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}