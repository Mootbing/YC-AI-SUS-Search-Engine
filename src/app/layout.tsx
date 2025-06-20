import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YC AI SUS Search Engine",
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
        {children}
      </body>
    </html>
  );
}
