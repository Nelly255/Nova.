import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debt Payoff Strategy Calculator",
  description: "Strategize the fastest way to become debt-free. Calculate interest saved using the snowball or avalanche methods.",
  openGraph: {
    title: "Debt Payoff Strategy Calculator | Nova",
    description: "Build a mathematical plan to crush your loans and become debt-free.",
    url: "https://nova.co.tz/debt-payoff-calculator",
  }
};

export default function DebtPayoffCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}