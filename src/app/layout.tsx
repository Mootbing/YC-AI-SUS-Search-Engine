import type { Metadata } from "next";
import "./globals.css";
import ClientAuthProvider from "@/components/ClientAuthProvider";

export const metadata: Metadata = {
  title: "YCombinator Start School Search Engine",
  description: "Search through curated startup and tech content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  );
}
