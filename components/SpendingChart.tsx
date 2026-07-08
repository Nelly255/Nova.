"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function SpendingChart({ 
  selectedMonth, 
  selectedYear,
  currencySymbol 
}: { 
  selectedMonth: number; 
  selectedYear: number; 
  currencySymbol: string; 
}) {
  const [chartData, setChartData] = useState<{ week: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  
  // 🚀 ADDED: React state to track the currently active/tapped bar
  const [activeBar, setActiveBar] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndBuildChart = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("type", "expense");

      if (!error && data) {
        const periodTransactions = data.filter((t: any) => {
          const d = new Date(t.date);
          
          const categoryName = (t.category || '').toLowerCase();
          const typeName = (t.type || '').toLowerCase();
          
          const isInternalTransfer = 
            categoryName === 'contra' || 
            categoryName === 'transfer' || 
            typeName === 'transfer';

          return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear && !isInternalTransfer;
        });

        const weeks = [0, 0, 0, 0];
        let totalSpent = 0;

        periodTransactions.forEach((t: any) => {
          const day = new Date(t.date).getDate();
          const amount = Number(t.amount);
          totalSpent += amount;

          if (day <= 7) weeks[0] += amount;
          else if (day <= 14) weeks[1] += amount;
          else if (day <= 21) weeks[2] += amount;
          else weeks[3] += amount; 
        });

        setHasData(totalSpent > 0);
        setChartData([
          { week: "Week 1", amount: weeks[0] },
          { week: "Week 2", amount: weeks[1] },
          { week: "Week 3", amount: weeks[2] },
          { week: "Week 4", amount: weeks[3] },
        ]);
      }
      
      setLoading(false);
    };

    fetchAndBuildChart();

    window.addEventListener('transactionUpdated', fetchAndBuildChart);
    return () => window.removeEventListener('transactionUpdated', fetchAndBuildChart);
    
  }, [selectedMonth, selectedYear]); 

  if (loading) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center text-brand-500/50">
        <Loader2 className="animate-spin mb-2" size={24} />
        <p className="text-sm font-medium">Crunching numbers...</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="w-full h-48 flex items-center justify-center border-2 border-dashed border-slate-200/50 dark:border-white/5 rounded-2xl">
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No spending data for this period.</p>
      </div>
    );
  }

  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

  return (
    <div className="w-full h-56 flex items-end justify-between gap-2 sm:gap-4 pt-12">
      {chartData.map((data, index) => {
        const heightPercentage = Math.max((data.amount / maxAmount) * 100, 5);
        const isActive = activeBar === data.week;
        
        return (
          <div 
            key={data.week} 
            className="relative flex flex-col items-center flex-1 h-full justify-end cursor-pointer"
            // 🚀 ADDED: Event handlers for touch & mouse
            onClick={() => setActiveBar(isActive ? null : data.week)}
            onMouseEnter={() => setActiveBar(data.week)}
            onMouseLeave={() => setActiveBar(null)}
          >
            
            {/* TOOLTIP (Now controlled by React state instead of CSS hover) */}
            <div className={`absolute -top-14 transition-all duration-300 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold py-2 px-3 sm:px-4 rounded-xl shadow-2xl whitespace-nowrap z-20 pointer-events-none ${
              isActive ? 'opacity-100 -translate-y-2 scale-100' : 'opacity-0 transform scale-95'
            }`}>
              {currencySymbol}{data.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
            </div>

            {/* THE PILL BARS */}
            <div className={`w-full relative flex justify-center h-full items-end transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
              
              {/* Background Track */}
              <div className="absolute w-8 sm:w-10 md:w-12 h-full bg-slate-100/80 dark:bg-white/5 rounded-t-full border border-slate-200/50 dark:border-white/5 transition-colors z-0"></div>
              
              {/* The Glowing Data Bar */}
              <div 
                className={`w-8 sm:w-10 md:w-12 bg-brand-500 rounded-t-full z-10 transition-all duration-1000 ease-out relative overflow-hidden ${isActive ? 'brightness-125' : ''}`}
                style={{ 
                  height: `${heightPercentage}%`,
                  animationDelay: `${index * 100}ms`,
                  boxShadow: data.amount > 0 ? '0 0 20px rgb(var(--brand-500)/0.4)' : 'none'
                }}
              >
                {/* Inner 3D Highlight */}
                <div className={`absolute inset-0 w-full h-full rounded-t-full bg-gradient-to-b from-white/30 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
              </div>
            </div>
            
            {/* X-Axis Label */}
            <div className={`mt-4 text-xs font-bold transition-colors ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}>
              {data.week}
            </div>
            
          </div>
        );
      })}
    </div>
  );
}