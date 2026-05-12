import "./globals.css";
import { Toaster } from "@/ui/toaster";

export const metadata = {
  title: "CodeReview AI",
  description: "AI-powered code review platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

