import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emergency Fund Target Calculator",
  description: "Determine exactly how much cash you need in your Tanzanian emergency fund to survive unexpected life events.",
  openGraph: {
    title: "Emergency Fund Calculator | Nova",
    description: "Calculate your ideal financial safety net to protect against the unexpected.",
    url: "https://nova.co.tz/emergency-fund-calculator",
  }
};

export default function EmergencyFundCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}