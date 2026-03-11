import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: "IT Infrastructure Manager",
  description: "Monitor and manage your IT infrastructure",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="bg-slate-950 text-slate-100 font-mono antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}