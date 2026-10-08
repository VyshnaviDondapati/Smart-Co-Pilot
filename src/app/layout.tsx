import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClinicalAIChatbot from "@/components/ClinicalAIChatbot";
import StaffChatWidget from "@/components/StaffChatWidget";
import { IntakeProvider } from "@/context/IntakeContext";
import { StaffChatProvider } from "@/context/StaffChatContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Triage Co-Pilot — Rural Healthcare Decision Support",
  description:
    "AI-powered rural healthcare triage and clinical decision support system for Primary Health Centres.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#030712] text-gray-100">
        <IntakeProvider>
          <StaffChatProvider>
            {children}
            <ClinicalAIChatbot />
            <StaffChatWidget />
          </StaffChatProvider>
        </IntakeProvider>
      </body>
    </html>
  );
}
