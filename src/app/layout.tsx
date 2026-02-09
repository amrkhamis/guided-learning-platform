import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guided Learning",
  description:
    "Learn anything with a personalized AI tutor that guides you step by step",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
