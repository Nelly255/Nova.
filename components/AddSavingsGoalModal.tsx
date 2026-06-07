"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AddSavingsGoalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Default start date to today
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    start_date: today, // 🚀 Tracks when the saving goal was started
    target_date: "",
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
    setFormData({ ...formData, target_amount: rawValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.from("savings_goals").insert([
      {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        current_amount: 0,
        target_date: formData.target_date,
        created_at: new Date(formData.start_date).toISOString(), // Overrides default creation date for the Time Machine
      },
    ]);

    setIsLoading(false);

    if (error) {
      console.error("Error saving goal:", error.message);
      alert("Failed to save goal.");
    } else {
      setIsOpen(false);
      setFormData({ name: "", target_amount: "", start_date: today, target_date: "" });
      
      window.dispatchEvent(new Event("goalUpdated")); 
    }
  };

  return (
    <div className="relative">
      
      {/* UPGRADED: Solid Brand Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50 bg-brand-600 hover:bg-brand-500 text-white shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm"
      >
        <Plus size={18} /> Create Goal
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* UPGRADED: Popover anchored to the right, now scrollable on small screens */}
          <div className="absolute right-0 top-full mt-3 z-50 w-[calc(100vw-4rem)] sm:w-96 glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 origin-top-right duration-200 flex flex-col max-h-[75vh]">
            
            {/* Added shrink-0 so header doesn't squish */}
            <div className="flex justify-between items-center p-6 border-b border-zinc-200/80 dark:border-white/5 transition-colors shrink-0">
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors">New Savings Goal</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            {/* Added overflow-y-auto for scrollability */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Goal Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g., Emergency Fund, New Macbook"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Target Amount</label>
                <input 
                  required
                  type="text" 
                  inputMode="decimal"
                  placeholder="e.g., 5,000"
                  value={formatAmountForDisplay(formData.target_amount)}
                  onChange={handleAmountChange}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  {/* 🚀 UPGRADED: Renamed label to Start Date */}
                  <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Start Date</label>
                  <input 
                    required
                    type="date" 
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Target Date</label>
                  <input 
                    required
                    type="date" 
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              {/* UPGRADED: Solid Brand Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full shrink-0 bg-brand-600 hover:bg-brand-500 text-white shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 font-bold py-3.5 rounded-xl mt-4 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Save Goal"}
              </button>
            </form>

          </div>
        </>
      )}
    </div>
  );
}