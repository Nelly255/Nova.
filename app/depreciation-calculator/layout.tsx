import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TRA Asset Depreciation Calculator",
  description: "Calculate capital allowance and asset depreciation per Tanzanian tax laws. Perfect for business owners and accountants.",
  openGraph: {
    title: "TRA Asset Depreciation Calculator | Nova",
    description: "Calculate capital allowance and asset depreciation accurately.",
    url: "https://nova.co.tz/depreciation-calculator",
  }
};

export default function DepreciationCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}