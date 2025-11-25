"use client"

import { useEffect } from "react"

export const applyTheme = (newTheme: "light" | "dark") => {
  if (newTheme === "dark") {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
}

export default function ThemeLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
      if (savedTheme) {
        applyTheme(savedTheme)
      } else {
        // Проверка системной темы
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        applyTheme(systemTheme)
      }
    }, [])

    return (
      <div>{ children }</div>
    )

}