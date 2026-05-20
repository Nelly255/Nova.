import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Net Worth Calculator Tanzania",
  description: "Calculate your exact wealth standing in Tanzania. Track your assets, liabilities, and true net worth.",
  openGraph: {
    title: "Net Worth Calculator | Nova",
    description: "Calculate your true wealth and track your financial standing in Tanzania.",
    url: "https://nova.co.tz/net-worth-calculator",
  }
};

export default function NetWorthCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}