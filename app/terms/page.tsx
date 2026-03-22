"use client";

import Link from "next/link";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Activity, ArrowLeft } from "lucide-react";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function TermsOfService() {
  return (
    <main className={`min-h-screen bg-slate-50 dark:bg-[#0A0A0E] text-slate-900 dark:text-slate-50 flex flex-col selection:bg-indigo-500/30 transition-colors duration-500 ${bodyFont.className}`}>
      
      {/* Simple Header */}
      <header className="w-full max-w-4xl mx-auto px-6 pt-8 pb-4 flex justify-between items-center z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <Activity size={24} className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className={`${headerFont.className} font-extrabold text-xl tracking-tight text-slate-900 dark:text-white`}>
            Nova.
          </span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </header>

      {/* Content */}
      <div className="w-full max-w-3xl mx-auto px-6 py-12 md:py-20 z-10 flex-1">
        <div className="mb-12">
          <h1 className={`${headerFont.className} text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight`}>
            Terms of Service
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Last updated: March 22, 2026</p>
        </div>

        <div className="space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className={`${headerFont.className} text-2xl font-bold text-slate-900 dark:text-white mb-3`}>1. Agreement to Terms</h2>
            <p>
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Nova (“we,” “us” or “our”), concerning your access to and use of the Nova wealth management application. You agree that by accessing the application, you have read, understood, and agree to be bound by all of these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className={`${headerFont.className} text-2xl font-bold text-slate-900 dark:text-white mb-3`}>2. User Representations</h2>
            <p className="mb-3">By using the application, you represent and warrant that:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>All registration information you submit will be true, accurate, current, and complete.</li>
              <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
              <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
              <li>You will not use the application for any illegal or unauthorized purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className={`${headerFont.className} text-2xl font-bold text-slate-900 dark:text-white mb-3`}>3. Prohibited Activities</h2>
            <p>
              You may not access or use the application for any purpose other than that for which we make the application available. The application may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us. Systematically retrieving data or other content from the application to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us is prohibited.
            </p>
          </section>

          <section>
            <h2 className={`${headerFont.className} text-2xl font-bold text-slate-900 dark:text-white mb-3`}>4. Modifications and Interruptions</h2>
            <p>
              We reserve the right to change, modify, or remove the contents of the application at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our application. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the application.
            </p>
          </section>

          <section>
            <h2 className={`${headerFont.className} text-2xl font-bold text-slate-900 dark:text-white mb-3`}>5. Contact Us</h2>
            <p>
              In order to resolve a complaint regarding the application or to receive further information regarding use of the application, please contact us at: info@nova.co.tz
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto py-8 border-t border-slate-200 dark:border-white/5 text-center text-sm text-slate-500 px-6">
        © {new Date().getFullYear()} Nova Wealth Management. All rights reserved.
      </footer>
    </main>
  );
}