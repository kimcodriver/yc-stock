import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TopBar, BottomNav } from "@/components/nav";

export const metadata: Metadata = {
  title: "YC Stock — ระบบจัดการสต็อก Yogurt Culture",
  description: "กรอกสต็อกสิ้นวัน · เติมของ · ยอดขาย · reconcile ถ้วย",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FBF7F0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="flex min-h-[100dvh] flex-col">
          <TopBar />
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 pb-6">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
