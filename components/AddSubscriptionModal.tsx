"use client";

import { useState } from "react";
import { Plus, X, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AddSubscriptionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [warning, setWarning] = useState(""); // 🚀 NEW: State to hold our duplicate warning

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    billing_date: "",
  });

  const formatAmountForDisplay = (value: string) => {
    if (!value) return "";
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/[^0-9.]/g, "");
    const parts = rawValue.split(".");
    if (parts.length > 2) {
      rawValue = parts[0] + "." + parts.slice(1).join("");
    }
    setFormData({ ...formData, amount: rawValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWarning(""); // Clear any old warnings
    setIsLoading(true);

    // 🚀 THE VAULT GUARD: Check for duplicate subscription names before saving
    const { data: existingSubs, error: checkError } = await supabase
      .from("subscriptions")
      .select("id")
      .ilike("name", formData.name);

    if (existingSubs && existingSubs.length > 0) {
      setIsLoading(false);
      setWarning(`A subscription named "${formData.name}" already exists. Please choose a different name.`);
      return; // Stop the function here so it doesn't save!
    }

    const amountNum = parseFloat(formData.amount);

    // Only insert the subscription (Removed the hidden auto-transaction code!)
    const { error: subError } = await supabase.from("subscriptions").insert([
      {
        name: formData.name,
        amount: amountNum,
        billing_date: parseInt(formData.billing_date, 10),
      },
    ]);

    setIsLoading(false);

    if (subError) {
      console.error("Error saving data:", subError);
      setWarning("Failed to save. Check your connection.");
    } else {
      setIsOpen(false);
      setFormData({ name: "", amount: "", billing_date: "" });
      setWarning("");
      window.dispatchEvent(new Event("subscriptionUpdated")); 
    }
  };

  return (
    <div className="relative">
      
      {/* UPGRADED: Vibrant Anchor Trigger Button */}
      <button 
        onClick={() => { setIsOpen(!isOpen); setWarning(""); }}
        className="relative z-50 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm"
      >
        <Plus size={18} /> Add Subscription
      </button>

      {isOpen && (
        <>
          {/* The Blur Overlay */}
          <div 
            className="fixed inset-0 z-40 bg-zinc-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* UPGRADED: Popover anchored to the right, now scrollable on small screens */}
          <div className="absolute right-0 top-full mt-3 z-50 w-[calc(100vw-4rem)] sm:w-96 glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 origin-top-right duration-200 flex flex-col max-h-[75vh]">
            
            {/* Added shrink-0 so header doesn't squish */}
            <div className="flex justify-between items-center p-6 border-b border-zinc-200/80 dark:border-white/5 transition-colors shrink-0">
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors">New Subscription</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            {/* Added overflow-y-auto for scrollability */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              
              {/* 🚀 NEW: The Inline Warning Box */}
              {warning && (
                <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium leading-tight">
                    {warning}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Service Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g., Netflix, Gym, Spotify"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setWarning(""); // Clear warning when they start typing again
                  }}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Monthly Cost</label>
                  <input 
                    required
                    type="text" 
                    inputMode="decimal"
                    placeholder="2,000"
                    value={formatAmountForDisplay(formData.amount)}
                    onChange={handleAmountChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Billing Day</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    max="31"
                    placeholder="e.g., 14"
                    value={formData.billing_date}
                    onChange={(e) => setFormData({ ...formData, billing_date: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* UPGRADED: Vibrant Anchor Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 font-bold py-3.5 rounded-xl mt-4 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Save Subscription"}
              </button>
            </form>

          </div>
        </>
      )}
    </div>
  );
}