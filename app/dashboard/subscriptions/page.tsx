"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddSubscriptionModal from "@/components/AddSubscriptionModal";
import EditSubscriptionModal from "@/components/EditSubscriptionModal"; 
import { ShieldCheck, Play, Music, Dumbbell, Zap, CreditCard, CalendarClock, Trash2 } from "lucide-react";

const getSubIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('netflix') || lower.includes('hulu') || lower.includes('tv') || lower.includes('disney')) return <Play size={24} />;
  if (lower.includes('spotify') || lower.includes('apple') || lower.includes('music')) return <Music size={24} />;
  if (lower.includes('gym') || lower.includes('fitness')) return <Dumbbell size={24} />;
  if (lower.includes('electric') || lower.includes('water') || lower.includes('wifi')) return <Zap size={24} />;
  return <CreditCard size={24} />;
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for our dynamic currency symbol
  const [currencySymbol, setCurrencySymbol] = useState("$");

  useEffect(() => {
    // 1. Check local storage for the saved currency preference
    const savedCurrency = localStorage.getItem("app_currency");
    if (savedCurrency === "TZS") {
      setCurrencySymbol("TSh ");
    } else {
      setCurrencySymbol("$");
    }

    // 2. Fetch the Subscriptions
    const fetchSubs = async () => {
      const { data, error } = await supabase.from("subscriptions").select("*").order("billing_date", { ascending: true });
      if (!error && data) setSubscriptions(data);
      setLoading(false);
    };
    
    fetchSubs();

    // PATCHED: Listen for the silent update from the AddSubscriptionModal popover!
    window.addEventListener("subscriptionUpdated", fetchSubs);
    return () => window.removeEventListener("subscriptionUpdated", fetchSubs);
  }, []);

  // Delete Function
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("subscriptions").delete().eq("id", id);
    if (!error) {
      // Remove it from the screen immediately without reloading
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
    } else {
      console.error("Failed to delete", error);
    }
  };

  const totalMonthly = subscriptions.reduce((acc, sub) => acc + Number(sub.amount), 0);
  const totalYearly = totalMonthly * 12;

  const today = new Date().getDate();
  const upcomingBills = subscriptions.filter(sub => sub.billing_date >= today);
  const nextBill = upcomingBills.length > 0 ? upcomingBills[0] : subscriptions[0]; 

  return (
    <div className="p-8 md:p-10 max-w-6xl mx-auto space-y-8 pb-20 bg-transparent min-h-screen">
      {/* Added bg-transparent and min-h-screen to let the global mesh gradient shine */}
      
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Subscriptions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage your recurring monthly bills.</p>
        </div>
        <AddSubscriptionModal />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Replaced heavy classes with glass-card */}
        <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 transition-colors">Total Monthly Cost</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 transition-colors">
            {currencySymbol}{totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
        
        <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 transition-colors">Total Yearly Cost</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 transition-colors">
            {currencySymbol}{totalYearly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>

        {/* Next Bill Card upgraded to glass-card with a subtle inner glow */}
        <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center relative overflow-hidden transition-colors">
          {/* Subtle color blob for the special card */}
          <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 pointer-events-none rounded-[2rem]"></div>
          
          <div className="absolute -right-6 -top-6 text-indigo-500/10 dark:text-indigo-500/20 transition-colors">
            <CalendarClock size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-1 transition-colors">Next Bill Due</p>
            {nextBill ? (
              <>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors">{nextBill.name}</h2>
                <p className="text-indigo-500 dark:text-indigo-300/80 text-sm mt-1 transition-colors font-medium">
                  Due on the {nextBill.billing_date}th • {currencySymbol}{Number(nextBill.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </>
            ) : (
              <h2 className="text-xl font-bold text-slate-500 dark:text-slate-400 transition-colors">No active bills</h2>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 transition-colors">Active Subscriptions</h3>
        
        {loading ? (
          <p className="text-slate-500">Loading your subscriptions...</p>
        ) : subscriptions.length === 0 ? (
          /* Empty state glass-card */
          <div className="glass-card p-12 rounded-[2rem] text-center flex flex-col items-center justify-center transition-colors">
            <ShieldCheck size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-4 transition-colors" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 transition-colors">No subscriptions yet</h3>
            <p className="text-slate-500 mt-2">Add your first recurring bill to start tracking it.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((sub) => (
              /* Individual Subscription glass-card */
              <div key={sub.id} className="glass-card p-6 rounded-[2rem] hover:bg-white/40 dark:hover:bg-white/5 transition duration-300 flex flex-col justify-between relative group">
                
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                  <EditSubscriptionModal sub={sub} />
                  {/* Action button backdrop blurs */}
                  <button 
                    onClick={() => handleDelete(sub.id)}
                    className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 bg-white/50 dark:bg-black/20 hover:bg-rose-100 dark:hover:bg-rose-500/10 p-2 rounded-lg transition-all backdrop-blur-md"
                    title="Delete Subscription"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex justify-between items-start">
                  {/* Inner elements frosted effects */}
                  <div className="w-14 h-14 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-sm backdrop-blur-sm transition-colors">
                    {getSubIcon(sub.name)}
                  </div>
                  <span className="bg-slate-50/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-slate-700 dark:text-slate-300 font-medium text-xs px-3 py-1.5 rounded-full mr-16 backdrop-blur-sm transition-colors">
                    Day {sub.billing_date}
                  </span>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 transition-colors">{sub.name}</h3>
                  <div className="flex items-end gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-900 dark:text-slate-50 transition-colors">
                      {currencySymbol}{Number(sub.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm mb-1 font-medium">/mo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}