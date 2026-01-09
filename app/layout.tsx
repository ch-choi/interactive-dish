import type { Metadata } from "next";
import "./globals.css";

import SmoothScroll from "../components/SmoothScroll";

export const metadata: Metadata = {
  title: "Interactive Dish - Palmer Clone",
  description: "High-quality dinnerware clone coding project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased text-neutral-900 bg-neutral-50" suppressHydrationWarning>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
