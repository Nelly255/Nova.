"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted or rejected
    const consent = localStorage.getItem("nova_cookie_consent");
    
    if (!consent) {
      // Add a slight 1-second delay so it slides in smoothly after the page loads
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("nova_cookie_consent", "accepted");
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("nova_cookie_consent", "rejected");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    // UPGRADED: Centered on mobile, bottom-right on desktop
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 sm:bottom-6 z-[999] w-[calc(100vw-2rem)] sm:w-[400px] p-6 glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-8 fade-in duration-500 border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium transition-colors">
        We use cookies to ensure you get the best experience in your vault. By continuing to use this site, you agree to our policy. Read more in our{" "}
        {/* UPGRADED: Linked to the actual Privacy Policy page */}
        <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition-colors">
          Privacy Policy
        </Link>.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={handleAccept}
          className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)]"
        >
          Accept
        </button>
        <button
          onClick={handleReject}
          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all hover:-translate-y-0.5 active:scale-95"
        >
          Reject
        </button>
      </div>
    </div>
  );
}