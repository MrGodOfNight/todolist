import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/_contexts/AuthContext";
import AuthenticatedLayout from "@/_layouts/AuthenticatedLayout";
import ThemeLayout from "@/_layouts/ThemeLayout";

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
        <ThemeLayout>
          <AuthProvider>
            <AuthenticatedLayout>
              {children}
            </AuthenticatedLayout>
          </AuthProvider>
        </ThemeLayout>
      </body>
    </html>
  );
}
