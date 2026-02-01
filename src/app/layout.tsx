import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "@/context/ChatContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Groq Chat - Premium AI Assistant",
  description:
    "A premium AI chatbot powered by Groq for daily assistance with coding, writing, learning, and problem-solving.",
  keywords: [
    "AI",
    "chatbot",
    "Groq",
    "assistant",
    "coding",
    "writing",
    "learning",
  ],
  authors: [{ name: "Suman Sah" }],
  creator: "Suman Sah",
  publisher: "Suman Sah",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Groq Chat - Premium AI Assistant",
    description: "A premium AI chatbot powered by Groq for daily assistance",
    type: "website",
    locale: "en_US",
    siteName: "Groq Chat",
  },
  twitter: {
    card: "summary_large_image",
    title: "Groq Chat - Premium AI Assistant",
    description: "A premium AI chatbot powered by Groq for daily assistance",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#09090b",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased`}
        suppressHydrationWarning
      >
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
