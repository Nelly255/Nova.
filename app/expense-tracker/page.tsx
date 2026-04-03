import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Wallet, PieChart, Zap, Smartphone, ShieldCheck } from "lucide-react";

// 🚀 1. SEO METADATA (What shows up on Google and WhatsApp)
export const metadata: Metadata = {
  title: "Best Expense Tracker in Tanzania | Nova",
  description: "Stop wondering where your money goes. Track TSh, mobile money, and daily expenses with Nova's intelligent financial dashboard.",
  alternates: {
    canonical: "https://nova.co.tz/expense-tracker",
  },
  openGraph: {
    title: "Nova | Intelligent Expense Tracking",
    description: "The ultimate tool to manage your TSh, crush debt, and build wealth.",
    url: "https://nova.co.tz/expense-tracker",
    type: "website",
  }
};

export default function ExpenseTrackerPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 transition-colors duration-500 relative overflow-hidden">
      
      {/* 🚀 2. SCHEMA MARKUP (Hidden data that makes Google love you) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Nova Expense Tracker",
            "operatingSystem": "Web, iOS, Android",
            "applicationCategory": "FinanceApplication",
            "description": "The #1 financial tracking tool for Tanzanians to manage wealth, track TSh, and monitor expenses.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "TZS"
            }
          })
        }}
      />

      {/* GLOBAL AMBIENT GLOW (Matches your layout) */}
      <div className="fixed top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10">
        {/* NAVIGATION */}
        <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
            Sign In to Vault
          </Link>
        </nav>

        {/* HERO SECTION (H1 is the most important SEO tag) */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold mb-8 uppercase tracking-widest">
            <Zap size={14} className="animate-pulse" /> Powering Tanzanian Wealth
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 dark:text-white">
            Take absolute control of your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">daily spending.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            From M-Pesa transfers to daily Luku purchases, Nova helps you track every single shilling. Categorize expenses, set budgets, and never ask "Where did my money go?" again.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2">
              Start Tracking for Free
            </Link>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            
            <FeatureCard 
              icon={<Smartphone size={28} />}
              title="Mobile Money Ready"
              description="Perfect for the Tanzanian economy. Track your mobile money fees, transfers, and withdrawals alongside your bank accounts."
            />
            
            <FeatureCard 
              icon={<PieChart size={28} />}
              title="Visualized Cash Flow"
              description="Beautiful, intuitive charts that show exactly what percentage of your income is going to rent, food, transport, and savings."
            />

            <FeatureCard 
              icon={<ShieldCheck size={28} />}
              title="Private & Secure"
              description="Your financial data is locked in your personal vault. We don't sell your data, and your net worth remains completely private."
            />

          </div>
        </section>

        {/* BOTTOM CTA / SOCIAL PROOF */}
        <section className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[3rem] p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              Ready to crush your budget?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
              Join the new generation of Tanzanians who are building real wealth through intelligent expense tracking.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform">
              <Wallet size={20} />
              Open Your Nova Vault
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

// Helper Component for the Feature Cards
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-white/5 hover:-translate-y-2 transition-transform duration-300">
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}