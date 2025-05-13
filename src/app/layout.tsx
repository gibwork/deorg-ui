import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import NextTopLoader from "nextjs-toploader";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/providers/query-provider";
import { LoadingModal } from "@/components/modals/loading-modal";
import { siteConfig } from "../../config/site";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ClerkProvider } from "@/components/providers/clerk-provider";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "devide-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_APP_URL}`),
  title: {
    default: siteConfig.name,
    template: `%s`,
  },
  description: siteConfig.description,
  icons: [
    {
      url: "/images/work_logo.png",
      href: "/images/work_logo.png",
    },
  ],
  openGraph: {
    siteName: "Gib.work",
    url: new URL(`${process.env.NEXT_PUBLIC_APP_URL}`),
    images: [
      {
        type: "image/png",
        width: 1200,
        height: 630,
        url: "https://cdn.gib.work/metadata/default.png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@gib_work",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider>
            <WalletProvider>
              <QueryProvider>
                <Toaster position="bottom-left" richColors />

                {children}
                <LoadingModal />

                <NextTopLoader color="#8151fd" showSpinner={false} />
              </QueryProvider>
            </WalletProvider>
          </ClerkProvider>
        </ThemeProvider>
        {/* <ReportBugButton /> */}
      </body>
    </html>
  );
}
