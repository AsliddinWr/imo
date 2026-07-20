import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EnglishPeak",
    template: "%s | EnglishPeak",
  },
  description:
    "EnglishPeak is a realistic IELTS and CEFR practice platform with mock tests, progress tracking, and skill-based preparation.",
  applicationName: "EnglishPeak",
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
  authors: [{ name: "EnglishPeak" }],
  creator: "EnglishPeak",
  publisher: "EnglishPeak",
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
  themeColor: "#071A52",
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
