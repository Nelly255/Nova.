"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Edit2, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function EditSubscriptionModal({ sub }: { sub: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    name: sub.name,
    amount: sub.amount,
    billing_date: sub.billing_date,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase
      .from("subscriptions")
      .update({
        name: formData.name,
        amount: parseFloat(formData.amount as string),
        billing_date: parseInt(formData.billing_date as string, 10),
      })
      .eq("id", sub.id);

    setIsLoading(false);

    if (error) {
      console.error("Error updating subscription:", error.message);
      alert("Failed to update subscription. Check console.");
    } else {
      setIsOpen(false);
      window.location.reload(); 
    }
  };

  return (
    <>
      {/* PATCHED: Trigger button colors for light/dark */}
      <button 
        onClick={() => setIsOpen(true)}
        className="text-slate-400 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 p-2 rounded-lg transition-all transition-colors"
        title="Edit Subscription"
      >
        <Edit2 size={16} />
      </button>

      {isOpen && mounted && createPortal(
        /* PATCHED: Backdrop overlay */
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 transition-colors">
          {/* PATCHED: Modal card background and border */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left transition-colors">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800/60 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Edit Subscription</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1 transition-colors">Service Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1 transition-colors">Monthly Cost</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1 transition-colors">Billing Day</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    max="31"
                    value={formData.billing_date}
                    onChange={(e) => setFormData({ ...formData, billing_date: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-600/20"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Update Subscription"}
              </button>
            </form>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}