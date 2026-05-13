import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventory Platform",
  description: "Gestión de inventario multi-contexto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning evita errores por atributos dinámicos como temas */}
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}