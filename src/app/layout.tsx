import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Testora",
    template: "%s | Testora",
  },
  description: "IELTS and CEFR practice platform",
  applicationName: "Testora",
  keywords: [
    "IELTS",
    "CEFR",
    "Practice",
    "Mock Test",
    "English",
    "Reading",
    "Listening",
    "Writing",
    "Speaking",
  ],
  authors: [{ name: "Testora" }],
  creator: "Testora",
  publisher: "Testora",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#5B4FCF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}