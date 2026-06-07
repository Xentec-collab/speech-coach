import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Public Speaking Coach",
  description: "Practice public speaking and receive AI-powered coaching feedback."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
