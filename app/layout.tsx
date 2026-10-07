import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { MediaStoreProvider } from "@/lib/store";
import { FirestoreQuotaGuard } from "@/components/layout/FirestoreQuotaGuard";

export const metadata: Metadata = {
  title: "Agradhi Media Unit | Saranath College — Inter-School Media Assembly 2026",
  description: "Official portal for all-island school media units to register, submit competition entries, and track official adjudications.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-256.png", sizes: "256x256", type: "image/png" },
      { url: "/icons/icon-384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icons/icon-192.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/icons/icon-512.png" }],
  },
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
