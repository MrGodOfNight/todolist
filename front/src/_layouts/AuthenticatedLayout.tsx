"use client"

import Header from "../_components/Header"
import Footer from "../_components/Footer"
import { useAuth } from "@/_contexts/AuthContext"
import LoginForm from "../_components/LoginForm"

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()

  if (!token) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pt-20 pb-12">
        <LoginForm />
      </main>
    )
  }

  return (
    <div>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  )
}