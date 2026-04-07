"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun, ArrowRight, BellRing, Scissors, CreditCard, ShieldCheck } from "lucide-react";

export default function SubscriptionTrackerPage() {
  // THEME STATE
  const [isDark, setIsDark] = useState(true);

  // INITIAL THEME CHECK
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('app_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('app_theme', 'light');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#07070A] text-slate-900 dark:text-slate-50 transition-colors duration-500 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* 🚀 SCHEMA MARKUP (Optimized for Software Feature) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Nova Subscription Tracker",
            "operatingSystem": "Web, iOS, Android",
            "applicationCategory": "FinanceApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "TZS"
            },
            "description": "Track all your recurring subscriptions in one place. Get alerts before free trials end and stop wasting money on unused services in Tanzania."
          })
        }}
      />

      {/* AMBIENT GLOW (Rose & Purple to symbolize alerts and cutting costs) */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#E11D48]/10 dark:bg-[#E11D48]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#8438FF]/5 dark:bg-[#8438FF]/10 rounded-full blur-[120px] pointer-events-none opacity-60 z-0"></div>

      <div className="relative z-10 pt-6 md:pt-12 px-4 sm:px-6">
        
        {/* TOP NAV */}
        <nav className="max-w-6xl mx-auto mb-12 md:mb-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all font-semibold bg-white dark:bg-[#12121A] px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm active:scale-95 group text-sm md:text-base">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          
          <button 
            onClick={toggleTheme} 
            className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-[#12121A] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-[#1A1A24] transition-all active:scale-90"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* HERO SECTION */}
        <header className="max-w-6xl mx-auto mb-20 grid lg:grid-cols-2 gap-10 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E11D48] shadow-[0_0_8px_#E11D48] animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">SUBSCRIPTION RADAR</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[2rem] sm:text-5xl md:text-[3rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Stop leaking
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-[#E11D48] leading-[0.85] mt-1 md:mt-0">
                Cash.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              Track recurring bills <br />
              & <span className="text-slate-900 dark:text-white font-bold">Cut Unused Services.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md mb-8">
              From Netflix and Spotify to gym memberships and software trials. See exactly how much your subscriptions cost per year and never miss a cancellation window again.
            </p>
            
            <Link href="/login" className="inline-flex items-center justify-center gap-3 w-full sm:w-auto py-4 px-8 bg-[#8438FF] hover:bg-[#7328F5] text-white rounded-[1.5rem] font-bold text-[15px] shadow-[0_8px_20px_rgba(132,56,255,0.3)] transition-all duration-300 active:scale-95 group">
              Record Subscription <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </header>

        {/* BENTO BOX FEATURES */}
        <section className="max-w-6xl mx-auto pb-24">
          <div className="grid md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 group bg-white dark:bg-[#0F0F15]/80 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
                <BellRing size={24} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                Auto-Renew Alerts
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                Signed up for a 7-day free trial? We'll track it. Nova warns you before your card is charged so you can cancel in time and keep your hard-earned money.
              </p>
            </div>

            <div className="group bg-white dark:bg-[#0F0F15]/80 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-[#8438FF]/10 flex items-center justify-center text-[#8438FF] mb-6 border border-[#8438FF]/20">
                <Scissors size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                Cut the Fat
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                See a list of every active subscription. Keep the ones that bring you value, and instantly spot the ones draining your account.
              </p>
            </div>

            <div className="group bg-white dark:bg-[#0F0F15]/80 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 border border-amber-500/20">
                <CreditCard size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                Yearly Cost Breakdown
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                That "cheap" monthly app adds up. We automatically calculate the annual cost of your subscriptions in TSH so you see the real impact.
              </p>
            </div>

            <div className="md:col-span-2 group bg-white dark:bg-[#0F0F15]/80 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                Your Vault, Your Rules
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                Nova doesn't ask for your bank login credentials to track your subscriptions. You manually enter your active services, ensuring 100% privacy and zero risk to your bank accounts.
              </p>
            </div>

          </div>
        </section>

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;700;900&display=swap');
      `}</style>
    </div>
  );
}