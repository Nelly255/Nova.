import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nova. | Intelligent Wealth Management",
  description: "Your financial life, beautifully organized. Track assets, crush debt, and monitor cash flow from one powerful dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning prevents Next.js from complaining when our script changes the class early
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* THE MAGIC SCRIPT THAT KILLS THE FLASHBANG */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem('app_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      
      {/* UPGRADED: Added global base colors, smooth transitions, and fixed minimum height */}
      <body className={`${inter.className} antialiased bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 transition-colors duration-500 relative min-h-screen overflow-x-hidden`}>
        
        {/* GLOBAL AMBIENT MESH GRADIENT */}
        {/* We use 'fixed' instead of 'absolute' so the glowing orbs follow you even if you scroll down a long page! */}
        <div className="fixed top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none z-0 animate-pulse-slow"></div>
        <div className="fixed bottom-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-purple-500/20 dark:bg-purple-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none z-0"></div>

        {/* The main app content safely sits on top of the glowing background */}
        <div className="relative z-10">
          {children}
        </div>
        
      </body>
    </html>
  );
}