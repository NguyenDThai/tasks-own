import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CheckSquare } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { ToastContainer } from "react-toastify";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskMaster",
  description: "Personal task management application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 antialiased transition-colors duration-200")}>
        <ThemeProvider defaultTheme="system" storageKey="task-app-theme">
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 dark:bg-zinc-950/75 border-b border-zinc-200 dark:border-zinc-800">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
                    <CheckSquare className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    TaskMaster
                  </h1>
                </div>
                <div className="flex items-center space-x-3">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
              {children}
              <ToastContainer position="top-center" />
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
