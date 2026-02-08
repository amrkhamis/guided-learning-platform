import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guided Learning Platform",
  description:
    "Learn technical skills through interactive, AI-driven guided courses",
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
