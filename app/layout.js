import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata = {
  title: "Shift Rescue | 急な欠勤を、今すぐ埋める。",
  description:
    "急な欠勤が出たら、その場で近くのワーカーとマッチング。Shift Rescueは店舗の欠員募集とワーカーの即戦力をつなぐリアルタイム・マッチングサービスです。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="font-sans antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
