import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Demo AI Chat with LangChain, Pinecone, and Upstash",
  description:
    "Master the art of AI chat chains with LangChain, Pinecone, Upstash, and OpenAI. Elevate communication, harness the potential of intelligent conversations, and unlock the future of interaction.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
