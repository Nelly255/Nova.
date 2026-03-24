"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ADDED: Next.js router for redirects
import { supabase } from "@/lib/supabase"; // ADDED: Supabase client
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { ArrowRight, Shield, Zap, PieChart, Activity, TrendingUp, Wallet, Sun, Moon, CreditCard, Target, Lock } from "lucide-react";

// Initialize our premium startup fonts
const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function WelcomePage() {
  const [theme, setTheme] = useState('dark');
  const router = useRouter(); // ADDED: Initialize router

  // ADDED: Auth Check - Redirect logged-in users to dashboard instantly
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router]);

  // Auto system theme detection
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme');
    
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemPrefersDark ? 'dark' : 'light');
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('app_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <main className={`min-h-screen bg-slate-50 dark:bg-[#0A0A0E] text-slate-900 dark:text-slate-50 flex flex-col relative overflow-hidden selection:bg-indigo-500/30 transition-colors duration-500 ${bodyFont.className}`}>
      
      {/* Background Glow Effects - Forced to z-0 so they never block clicks */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none opacity-60 animate-pulse duration-1000 z-0"></div>
      <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex justify-between items-center z-[100] relative pointer-events-auto">
        <div className="flex items-center gap-2">
          <Activity size={28} className="text-indigo-600 dark:text-indigo-400" />
          <span className={`${headerFont.className} font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white transition-colors`}>
            Nova.
          </span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 relative z-[100]">
          
          {/* FIXED: Upgraded mobile tap target, added type="button", and fixed hover states for touch screens */}
          <button 
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center shrink-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full active:bg-slate-200 dark:active:bg-white/10 sm:hover:bg-slate-200 sm:dark:hover:bg-white/10 relative z-[100] cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link href="/login" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-semibold px-2 sm:px-4 py-2 transition-colors relative z-[100]">
            Log In
          </Link>
          <Link href="/signup" className="bg-white dark:bg-white/5 backdrop-blur-md text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-300 dark:hover:border-indigo-500/30 px-4 sm:px-5 py-2 rounded-full text-sm font-bold transition-all active:scale-95 shadow-sm relative z-[100]">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center z-10 pt-12 lg:pt-20 pb-16 px-6">
        
        {/* Left Column: Typography & CTA */}
        <div className="text-left flex flex-col items-start order-2 lg:order-1 relative z-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold mb-6 shadow-sm dark:shadow-2xl transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse"></span>
            "Give every dollar a purpose."
          </div>

          <h1 className={`${headerFont.className} text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08] text-slate-900 dark:text-white transition-colors`}>
            Your financial life, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 pr-4">
              beautifully organized.
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-lg leading-relaxed transition-colors">
            Track assets, crush debt, and monitor subscriptions from one breathtaking dashboard. Stop wondering where your money went, and start directing where it goes.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-30">
            <Link href="/signup" className="group inline-flex items-center justify-center gap-3 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-8 py-4 rounded-full text-base font-bold transition-all hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] active:scale-95 w-full sm:w-auto relative z-30">
              Start Tracking <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center gap-3 text-xs md:text-sm text-slate-500 font-medium mt-2 sm:mt-0 transition-colors">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0A0A0E] bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden transition-colors">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 10}&backgroundColor=transparent`} alt="avatar" className="w-full h-full object-cover opacity-80" />
                  </div>
                ))}
              </div>
              <span>Join 10k+ savers</span>
            </div>
          </div>
        </div>

        {/* Right Column: Illustration & Floating Widgets */}
        <div className="relative w-full h-[400px] lg:h-[550px] flex items-center justify-center order-1 lg:order-2 mt-10 lg:mt-0">
          
          <div className="relative w-full max-w-md z-10 flex items-center justify-center animate-[pulse_6s_ease-in-out_infinite]">
            <img 
              src="/hero-illustration.svg" 
              alt="Tracking finances" 
              className="w-full h-auto drop-shadow-xl dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative z-10 transition-all"
              style={{ minHeight: '300px', objectFit: 'contain' }} 
            />
          </div>

          <div className="absolute top-[40%] lg:top-[45%] -right-4 lg:right-2 z-20 animate-[bounce_4s_ease-in-out_infinite] delay-100">
            <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 p-4 rounded-2xl shadow-xl dark:shadow-2xl flex flex-col gap-1 w-48 transition-colors">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1 transition-colors">
                <Wallet size={14} className="text-indigo-600 dark:text-indigo-400" /> Total Balance
              </div>
              <h4 className={`${headerFont.className} text-2xl font-extrabold text-slate-900 dark:text-white transition-colors tracking-tight`}>$24,500.00</h4>
              <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold mt-1 bg-indigo-100 dark:bg-indigo-400/10 px-2 py-0.5 rounded-full w-fit transition-colors border border-indigo-200 dark:border-transparent">
                <TrendingUp size={10} /> +12% this month
              </div>
            </div>
          </div>

          <div className="absolute bottom-16 -left-4 lg:left-0 z-20 animate-[bounce_5s_ease-in-out_infinite] delay-300">
            <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 p-3.5 rounded-2xl shadow-xl dark:shadow-2xl flex items-center gap-4 w-56 transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0 transition-colors">
                <PieChart size={18} className="text-slate-700 dark:text-slate-300" />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-bold text-slate-900 dark:text-white transition-colors">Netflix Sub</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 transition-colors">Entertainment</span>
              </div>
              <span className={`${headerFont.className} text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors tracking-tight`}>-$15.99</span>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none z-0 transition-colors"></div>

        </div>
      </div>

      {/* Bento Box Features Section */}
      <div className="w-full max-w-7xl mx-auto px-6 py-10 z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className={`${headerFont.className} text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 transition-colors tracking-tight`}>Everything you need to build wealth.</h2>
          <p className="text-slate-600 dark:text-slate-400 transition-colors">We replaced six different apps with one powerful, unified dashboard. Stop jumping between spreadsheets and bank accounts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 group bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-xl dark:hover:bg-slate-800/50 transition-all hover:border-indigo-500/30 overflow-hidden relative">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-500/30 mb-6 text-indigo-600 dark:text-indigo-400">
              <PieChart size={24} />
            </div>
            <h3 className={`${headerFont.className} text-2xl font-bold text-slate-900 dark:text-white mb-3 transition-colors tracking-tight`}>Intelligent Cash Flow</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md leading-relaxed transition-colors">Visualize your entire financial life in real-time. Know exactly what comes in, what goes out, and where you can optimize to save more every single month.</p>
          </div>

          <div className="group bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-xl dark:hover:bg-slate-800/50 transition-all hover:border-rose-500/30 relative overflow-hidden">
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-500/5 dark:bg-rose-500/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/20 rounded-2xl flex items-center justify-center border border-rose-100 dark:border-rose-500/30 mb-6 text-rose-600 dark:text-rose-400">
              <Zap size={22} />
            </div>
            <h3 className={`${headerFont.className} text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors tracking-tight`}>Subscription Radar</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors">Spot hidden recurring charges instantly. Keep what you love, cut the rest.</p>
          </div>

          <div className="group bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-xl dark:hover:bg-slate-800/50 transition-all hover:border-cyan-500/30 relative overflow-hidden">
             <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-cyan-500/5 dark:bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-100 dark:border-cyan-500/30 mb-6 text-cyan-600 dark:text-cyan-400">
              <CreditCard size={22} />
            </div>
            <h3 className={`${headerFont.className} text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors tracking-tight`}>Debt Snowball</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors">Organize your liabilities and attack them systematically until you are 100% debt-free.</p>
          </div>

          <div className="md:col-span-2 group bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-xl dark:hover:bg-slate-800/50 transition-all hover:border-amber-500/30 overflow-hidden relative">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-amber-500/5 dark:bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-100 dark:border-amber-500/30 mb-6 text-amber-600 dark:text-amber-400">
              <Target size={24} />
            </div>
            <h3 className={`${headerFont.className} text-2xl font-bold text-slate-900 dark:text-white mb-3 transition-colors tracking-tight`}>Goal Setting & Assets</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md leading-relaxed transition-colors">Track depreciating assets like vehicles and equipment, while setting aside targeted funds for emergencies, vacations, or your first home.</p>
          </div>
        </div>
      </div>

      {/* Security / Control Card */}
      <div className="w-full max-w-7xl mx-auto px-6 pb-20 pt-6 z-10">
        <div className="group bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-10 md:p-16 rounded-[2rem] hover:shadow-xl dark:hover:bg-slate-800/50 transition-all hover:border-indigo-500/30 relative overflow-hidden text-center max-w-4xl mx-auto">
          <div className="absolute left-1/2 -top-32 -translate-x-1/2 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
          
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-500/30 mb-6 text-indigo-600 dark:text-indigo-400">
            <Lock size={24} />
          </div>
          
          <h2 className={`${headerFont.className} text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 transition-colors tracking-tight`}>Take control of your future.</h2>
          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed transition-colors">Your financial data is encrypted, secure, and entirely yours. Join thousands of users building wealth with Nova today.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto pt-8 pb-12 border-t border-slate-200 dark:border-white/5 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 transition-colors z-10 px-6">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-indigo-500" />
          <span className={`${headerFont.className} font-bold text-slate-600 dark:text-slate-400`}>Nova.</span> © {new Date().getFullYear()}
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms of Service</Link>
        </div>
      </footer>

    </main>
  );
}