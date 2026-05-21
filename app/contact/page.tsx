"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun, Mail, MapPin, Activity, Shield, Phone, HelpCircle } from "lucide-react";

// 📝 CUSTOM WHATSAPP ICON COMPONENT
const WhatsAppIcon = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

export default function ContactPage() {
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

      {/* 🚀 SCHEMA MARKUP FOR SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Nova Financial",
            "description": "Get in touch with the Nova Financial team in Tanzania.",
            "url": "https://nova.co.tz/contact"
          })
        }}
      />

      {/* AMBIENT GLOW */}
      <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-[600px] h-[600px] bg-[#8438FF]/10 dark:bg-[#8438FF]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0"></div>

      <div className="relative z-10 pt-6 md:pt-12 px-4 sm:px-6 flex flex-col min-h-screen">

        {/* TOP NAV */}
        <nav className="max-w-6xl mx-auto w-full mb-12 md:mb-16 flex items-center justify-between">
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

        {/* 🚀 HEADER SECTION */}
        <header className="max-w-6xl mx-auto w-full mb-20 grid lg:grid-cols-2 gap-10 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8438FF] shadow-[0_0_8px_#8438FF] animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">CONTACT US</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[4rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Get in
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-[#8438FF] leading-[0.85] mt-1 md:mt-0">
                Touch.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10 mb-4">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              We're here to help <br />
              & <span className="text-slate-900 dark:text-white font-bold">Support your journey.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md">
              Have a question about Nova? Want to partner with us? Reach out directly via WhatsApp or Email, and our team in Arusha will assist you immediately.
            </p>
          </div>
        </header>

        {/* MAIN CONTENT GRID */}
        <main className="max-w-6xl mx-auto w-full flex-grow pb-24 grid md:grid-cols-5 gap-8">
          
          {/* Contact Info Side */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#0F0F15]/80 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-3xl h-full flex flex-col justify-center gap-8">
              
              {/* Email Block */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#8438FF]/10 flex items-center justify-center text-[#8438FF] shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Email Us</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">For support and partnerships.</p>
                  <a href="mailto:info@nova.co.tz" className="text-base font-semibold text-[#8438FF] hover:underline">info@nova.co.tz</a>
                </div>
              </div>

              <div className="w-full h-[1px] bg-slate-100 dark:bg-white/5"></div>

              {/* WhatsApp Block */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0">
                  <WhatsAppIcon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">WhatsApp</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Direct chat with our team.</p>
                  <a href="https://wa.me/255787468830" target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-[#25D366] hover:underline">+255 787 468 8830</a>
                </div>
              </div>

              <div className="w-full h-[1px] bg-slate-100 dark:bg-white/5"></div>

              {/* Location Block */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Office</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Arusha,<br />
                    Tanzania
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* 🚀 NEW FAQ SECTION SIDE */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-[#0F0F15]/80 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-3xl relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#8438FF]/5 blur-[80px] pointer-events-none"></div>

              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <HelpCircle size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
              </div>

              <div className="space-y-4 relative z-10 flex-grow">
                {/* FAQ 1 */}
                <div className="p-5 md:p-6 rounded-2xl bg-slate-50 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 transition-all hover:border-[#8438FF]/30">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-base md:text-lg">Is Nova free to use?</h4>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    Yes! Our core expense tracking features and utility calculators are available to everyone at no cost. We are committed to helping Tanzanians achieve financial literacy.
                  </p>
                </div>

                {/* FAQ 2 */}
                <div className="p-5 md:p-6 rounded-2xl bg-slate-50 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 transition-all hover:border-[#8438FF]/30">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-base md:text-lg">How secure is my financial data?</h4>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    We utilize bank-grade 256-bit encryption. Your data is entirely yours, securely stored, and we never sell your personal information to third parties.
                  </p>
                </div>

                {/* FAQ 3 */}
                <div className="p-5 md:p-6 rounded-2xl bg-slate-50 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 transition-all hover:border-[#8438FF]/30">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-base md:text-lg">Can I track M-Pesa transactions?</h4>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    Absolutely. Nova is built specifically for the local economy, natively supporting TZS alongside direct manual tracking for M-Pesa, Tigo Pesa, and local bank accounts.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="w-full max-w-7xl mx-auto pt-12 pb-12 border-t border-slate-200 dark:border-white/5 z-10 relative mt-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#8438FF]" />
              <span className="font-bold text-slate-900 dark:text-white">Nova Financial.</span> © {new Date().getFullYear()}
            </div>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 font-medium"><Shield size={14} className="text-emerald-500"/> Bank-Grade Security</span>
            </div>
          </div>
        </footer>

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;700;900&display=swap');
      `}</style>
    </div>
  );
}