import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CheckSquare } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskMaster",
  description: "Personal task management application built with Next.js",
};

import { AuthProvider } from "@/components/AuthContext";
import Header from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storageKey = 'task-app-theme';
                  const theme = localStorage.getItem(storageKey) || 'system';
                  const root = document.documentElement;
                  root.classList.remove('light', 'dark');
                  
                  if (theme === 'system') {
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    root.classList.add(systemTheme);
                  } else {
                    root.classList.add(theme);
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body
        className={cn(
          inter.className,
          "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 antialiased transition-colors duration-200",
        )}
      >
        <AuthProvider>
          <ThemeProvider defaultTheme="system" storageKey="task-app-theme">
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                {children}
                <ToastContainer position="top-center" />
              </main>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
