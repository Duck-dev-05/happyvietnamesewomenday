import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Dancing_Script } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Chúc Mừng Ngày Phụ nữ Việt Nam 20/10",
  description:
    "Một lời chúc ngọt ngào tới những chị em thân yêu vào Ngày Phụ nữ Việt Nam 20/10",
  openGraph: {
    title: "Chúc Mừng Ngày Phụ nữ Việt Nam 20/10",
    description: "Một lời chúc ngọt ngào tới những chị em thân yêu",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${jakarta.variable} ${playfair.variable} ${dancing.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

