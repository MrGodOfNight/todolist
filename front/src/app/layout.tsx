import type { Metadata } from "next";
import "./globals.css";
import Header from "@/_components/Header";
import Footer from "@/_components/Footer";

export const metadata: Metadata = {
  title: "TodoList",
  description: "Simple todo list",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
