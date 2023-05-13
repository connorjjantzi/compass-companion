import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "@/utils/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Compass Companion",
  description: "Tool to help with compasses trading in Path of Exile",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
