import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zero-Based 50/30/20 Budget Calculator",
  description: "Generate a strict, optimized 50/30/20 spending plan tailored for your income in Tanzania.",
  openGraph: {
    title: "50/30/20 Budget Calculator | Nova",
    description: "Instantly create a zero-based budget and optimize your monthly income.",
    url: "https://nova.co.tz/budget-calculator",
  }
};

export default function BudgetCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}