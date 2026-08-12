import type { Metadata } from "next";
import { AppShell } from "@/src/components/layout/app-shell";
import "./globals.css";
import "./human-data.css";
import "./campaigns.css";
import "./whatsapp.css";
import "./strategies.css";
import "./settings.css";
import { AuthProvider } from "@/src/features/auth/auth-provider";

export const metadata: Metadata = {
  title: "Zapis.kz AI Sales",
  description: "Внутренняя панель управления AI Sales Assistant",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className="h-full antialiased"
    >
      <body className="min-h-full"><AuthProvider><AppShell>{children}</AppShell></AuthProvider></body>
    </html>
  );
}
