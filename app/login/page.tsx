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

  // Stashed Email State
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

    // Check for an auto-logout email stash on mount
    const stashedEmail = localStorage.getItem("nova_locked_email");
    if (stashedEmail) {
      setLockedEmail(stashedEmail);
      setEmail(stashedEmail); 
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
        <div className="w-full max-w-[400px] relative overflow-hidden">
          
          {errorMsg && (
            <div className="mb-8 flex items-center gap-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-sm font-medium leading-snug">{errorMsg}</p>
            </div>
          )}

          {lockedEmail ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-transparent rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-800 mb-4">
                  <Lock size={32} className="text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1 uppercase tracking-widest">Session Locked</p>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{lockedEmail}</h2>
              </div>

              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                    <Link href="/forgot-password" className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-0 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-800 rounded-none pl-9 pr-10 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none focus:border-slate-900 dark:focus:border-white focus:ring-0 transition-all font-medium [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]"
                      required
                      autoFocus
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold py-4 rounded-xl transition-all mt-8 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Unlock Vault"}
                </button>
              </form>

              <div className="mt-10 text-center">
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
            
            <div className="animate-in fade-in duration-500">
              <div className="text-center mb-10">
                <h1 className={`${headerFont.className} text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight`}>Welcome back</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Log in to access your financial vault.</p>
              </div>

              <div className="mb-8">
                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full flex justify-center items-center gap-3 bg-transparent border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                >
                  {isGoogleLoading ? <Loader2 className="animate-spin text-slate-400" size={20} /> : <GoogleIcon />}
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Or</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
              </div>

              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Email Address</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-0 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      placeholder="john@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-800 rounded-none pl-9 pr-4 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none focus:border-slate-900 dark:focus:border-white focus:ring-0 transition-all font-medium [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                    <Link href="/forgot-password" className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-0 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-800 rounded-none pl-9 pr-10 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none focus:border-slate-900 dark:focus:border-white focus:ring-0 transition-all font-medium [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || isGoogleLoading}
                  className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] mt-8 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
                </button>
              </form>

              <p className="mt-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                Don't have an account?{" "}
                <Link href="/signup" className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
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