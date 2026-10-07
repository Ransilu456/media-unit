import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { MediaStoreProvider } from "@/lib/store";
import { FirestoreQuotaGuard } from "@/components/layout/FirestoreQuotaGuard";

export const metadata: Metadata = {
  title: "Agradhi Media Unit | Saranath College — Inter-School Media Assembly 2026",
  description: "Official portal for all-island school media units to register, submit competition entries, and track official adjudications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth" data-scroll-behavior="smooth">
      <body className="bg-slate-50 text-slate-600 antialiased flex flex-col min-h-screen font-sans selection:bg-amber-100 selection:text-amber-900">
        <AuthProvider>
          <MediaStoreProvider>
            <FirestoreQuotaGuard>{children}</FirestoreQuotaGuard>
          </MediaStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
