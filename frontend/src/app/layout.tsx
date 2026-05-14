import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventory Platform",
  description: "Gestión de inventario multi-contexto",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        {/* ✅ Toaster Global: top-right, 4s duración */}
        <Toaster 
          position="top-right" 
          toastOptions={{ duration: 4000 }} 
        />
      </body>
    </html>
  );
}