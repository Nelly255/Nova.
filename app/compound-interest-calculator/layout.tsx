import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compound Interest Calculator Tanzania",
  description: "Project your investment growth over time with the power of compound interest in TZS.",
  openGraph: {
    title: "Compound Interest Calculator | Nova",
    description: "See how fast your wealth can grow with compound interest.",
    url: "https://nova.co.tz/compound-interest-calculator",
  }
};

export default function CompoundInterestCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}