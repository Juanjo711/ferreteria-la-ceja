import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import { NextAuthSessionProvider } from "@/components/providers/NextAuthSessionProvider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-headline",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ferretería La Ceja — El Atelier Industrial",
    template: "%s | Ferretería La Ceja",
  },
  description:
    "Ferretería La Ceja: herramientas, materiales de construcción, plomería, eléctricos y más en La Ceja del Tambo, Antioquia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO" className={`${plusJakartaSans.variable} ${manrope.variable}`}>
      <head>
        {/* Material Symbols Outlined — sistema de iconografía de las maquetas */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="font-body bg-background text-on-background antialiased">
        <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
      </body>
    </html>
  );
}
