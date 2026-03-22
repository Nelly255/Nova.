"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import CategoryChart from "@/components/CategoryChart";

export default function SpendingChart({ 
  selectedMonth, 
  selectedYear 
}: { 
  selectedMonth: number; 
  selectedYear: number; 
}) {
  const [chartData, setChartData] = useState<{ week: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency");
    setCurrencySymbol(savedCurrency === "TZS" ? "TSh " : "$");

    const fetchAndBuildChart = async () => {
      setLoading(true);
      
      // Fetch ONLY expenses (we don't want income messing up our spending chart)
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("type", "expense");

      if (!error && data) {
        // 1. Filter transactions to match the selected time-travel period
        const periodTransactions = data.filter((t: any) => {
          const d = new Date(t.date);
          return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        });

        // 2. Group the spending into 4 weeks
        const weeks = [0, 0, 0, 0];
        let totalSpent = 0;

        periodTransactions.forEach((t: any) => {
          const day = new Date(t.date).getDate();
          const amount = Number(t.amount);
          totalSpent += amount;

          if (day <= 7) weeks[0] += amount;
          else if (day <= 14) weeks[1] += amount;
          else if (day <= 21) weeks[2] += amount;
          else weeks[3] += amount; // Days 22+ go into Week 4
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

    // Listen for new transactions so the chart updates instantly
    window.addEventListener('transactionUpdated', fetchAndBuildChart);
    return () => window.removeEventListener('transactionUpdated', fetchAndBuildChart);
    
  }, [selectedMonth, selectedYear]); // UPGRADED: Re-runs instantly when the user changes the month/year!

  if (loading) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center text-indigo-500/50">
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

  // Find the highest spending week to set the ceiling of the chart (100% height)
  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

  return (
    <div className="w-full h-48 flex items-end justify-between gap-2 sm:gap-4 pt-8">
      {chartData.map((data, index) => {
        // Calculate how tall the bar should be (minimum 5% so empty weeks still show a tiny nub)
        const heightPercentage = Math.max((data.amount / maxAmount) * 100, 5);
        
        return (
          <div key={data.week} className="relative flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
            
            {/* Interactive Hover Tooltip */}
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap z-10 pointer-events-none">
              {currencySymbol}{data.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              {/* Tooltip Arrow */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
            </div>

            {/* The Animated Glass Bar */}
            <div className="w-full relative flex justify-center h-full items-end">
              {/* Background track (optional, looks cool for glassmorphism) */}
              <div className="absolute w-full max-w-[3rem] h-full bg-slate-100/50 dark:bg-slate-800/20 rounded-t-xl z-0"></div>
              
              {/* The Actual Data Bar */}
              <div 
                className="w-full max-w-[3rem] bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-xl z-10 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] group-hover:brightness-110"
                style={{ 
                  height: `${heightPercentage}%`,
                  animationDelay: `${index * 100}ms` 
                }}
              ></div>
            </div>
            
            {/* X-Axis Label */}
            <div className="mt-3 text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors">
              {data.week}
            </div>
            
          </div>
        );
      })}
    </div>
  );
}