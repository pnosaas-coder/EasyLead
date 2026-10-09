import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EasyLead | SaaS de Prospection B2B & Génération de Leads en Afrique",
  description:
    "Trouvez des milliers d'entreprises qualifiées en Afrique via Google Maps et personnalisez vos approches commerciales (WhatsApp, Email, Script) avec l'IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f4f8f4] text-[#142922] font-sans selection:bg-[#c6f432] selection:text-[#0b382c]">
        {children}
      </body>
    </html>
  );
}
