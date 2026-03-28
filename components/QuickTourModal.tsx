"use client";

import { useState, useEffect } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
// 🚀 UPGRADED: Added the Search icon for the new tour step!
import { LayoutDashboard, ArrowRightLeft, Target, ShieldCheck, X, ChevronRight, Check, Search } from "lucide-react";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function QuickTourModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if they've seen the tour already
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("has_seen_tour");
    if (!hasSeenTour) {
      // Small delay so it pops up smoothly after the dashboard loads
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const finishTour = () => {
    setIsVisible(false);
    localStorage.setItem("has_seen_tour", "true");
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishTour();
    }
  };

  const tourSteps = [
    {
      title: "Welcome to Nova.",
      description: "Let's take a 30-second tour to show you how to organize your financial life and build real wealth.",
      icon: <LayoutDashboard size={32} className="text-white" />,
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "1. The Overview",
      description: "Your command center. Watch your True Net Worth grow, monitor liquid cash, and track your safe-to-spend balance in real-time.",
      icon: <LayoutDashboard size={32} className="text-indigo-500" />,
      color: "from-slate-100 to-indigo-50 dark:from-slate-800 dark:to-indigo-500/20"
    },
    {
      title: "2. Transactions",
      description: "Log every coffee and paycheck. Categorize your spending so you know exactly where every dollar is going.",
      icon: <ArrowRightLeft size={32} className="text-emerald-500" />,
      color: "from-slate-100 to-emerald-50 dark:from-slate-800 dark:to-emerald-500/20"
    },
    {
      title: "3. Budgets",
      description: "Give every dollar a job. Set limits for groceries, entertainment, and more. We'll alert you if you get too close to the edge.",
      icon: <Target size={32} className="text-amber-500" />,
      color: "from-slate-100 to-amber-50 dark:from-slate-800 dark:to-amber-500/20"
    },
    {
      title: "4. Subscriptions",
      description: "Stop bleeding money. Use the Subscription Radar to catch hidden recurring charges before they drain your account.",
      icon: <ShieldCheck size={32} className="text-rose-500" />,
      color: "from-slate-100 to-rose-50 dark:from-slate-800 dark:to-rose-500/20"
    },
    // 🚀 NEW STEP: Command Palette / Global Search
    {
      title: "5. Global Search",
      description: "Work like a pro. Press Cmd/Ctrl + K on your keyboard or tap the Search icon to instantly jump anywhere in the app.",
      icon: <Search size={32} className="text-purple-500" />,
      color: "from-slate-100 to-purple-50 dark:from-slate-800 dark:to-purple-500/20"
    }
  ];

  if (!isVisible) return null;

  return (
    <>
      {/* Darkened Backdrop */}
      <div className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md bg-white dark:bg-[#0A0A0E] border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-300 relative flex flex-col">
          
          {/* Close Button */}
          <button 
            onClick={finishTour}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-white/50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all z-10"
          >
            <X size={18} />
          </button>

          {/* Dynamic Header Banner */}
          <div className={`h-32 bg-gradient-to-tr ${tourSteps[currentStep].color} flex items-center justify-center transition-colors duration-500 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/5 dark:bg-white/5 backdrop-blur-[2px]"></div>
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center scale-110">
              {tourSteps[currentStep].icon}
            </div>
          </div>

          {/* Text Content */}
          <div className="p-8 text-center flex-1">
            <h2 className={`${headerFont.className} text-2xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight`}>
              {tourSteps[currentStep].title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm md:text-base min-h-[60px]">
              {tourSteps[currentStep].description}
            </p>
          </div>

          {/* Footer Controls */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            {/* Step Indicators */}
            <div className="flex gap-1.5">
              {tourSteps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-indigo-600 dark:bg-indigo-400' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={finishTour}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Skip Tour
              </button>
              
              <button 
                onClick={nextStep}
                className="flex items-center gap-1 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:-translate-y-0.5 active:scale-95 shadow-lg transition-all"
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>Get Started <Check size={16} /></>
                ) : (
                  <>Next <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}