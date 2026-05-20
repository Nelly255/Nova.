import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gross Salary Target Calculator",
  description: "Reverse-engineer your dream net salary in Tanzania. Know exactly what gross salary to ask for in your next job negotiation.",
  openGraph: {
    title: "Gross Salary Target Calculator | Nova",
    description: "Reverse-engineer your take-home pay for your next salary negotiation.",
    url: "https://nova.co.tz/gross-salary-calculator",
  }
};

export default function GrossSalaryCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}