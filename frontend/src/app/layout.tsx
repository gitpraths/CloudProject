import type { Metadata } from "next";
import ClientShell from "@/components/ClientShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudProject",
  description: "Plagiarism analytics dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
