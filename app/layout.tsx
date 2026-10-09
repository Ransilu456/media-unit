import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { MediaStoreProvider } from "@/lib/store";
import { FirestoreQuotaGuard } from "@/components/layout/FirestoreQuotaGuard";
import { MediaSplashScreen } from "@/components/ui/MediaSplashScreen";

export const metadata: Metadata = {
  title: "Agradhi Media Unit | Saranath College",
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
    <html
      lang="en"
      className="h-full scroll-smooth"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register')) {
                  if (localStorage.getItem('agradhi_auth_theme_v1') === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.style.backgroundColor = '#090a0c';
                  }
                }
              } catch (e) {}
            `,
          }}
        />
        <Script
          id="splash-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var p = window.location.pathname;
                var isAuth = p.startsWith('/login') || p.startsWith('/register') || p.startsWith('/admin') || p.startsWith('/dashboard');
                var viewed = window.sessionStorage.getItem('agradhi_media_splash_viewed_v1');
                var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if (isAuth || viewed || reduce) {
                  document.documentElement.classList.add('no-splash');
                } else {
                  document.documentElement.classList.add('splash-active');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className="bg-slate-50 text-slate-600 antialiased flex flex-col min-h-screen font-sans selection:bg-amber-100 selection:text-amber-900"
        suppressHydrationWarning
      >
        <AuthProvider>
          <MediaStoreProvider>
            <MediaSplashScreen />
            <FirestoreQuotaGuard>{children}</FirestoreQuotaGuard>
          </MediaStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
