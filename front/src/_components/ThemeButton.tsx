"use client"

import { useState, useEffect } from "react"

export default function ThemeButton() {

  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Проверка системной темы
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setTheme(systemTheme)
      applyTheme(systemTheme)
    }
  }, [])

  const applyTheme = (newTheme: "light" | "dark") => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  return (
    <button onClick={toggleTheme} className="w-9 h-9 p-0 bg-gray-600">
      {theme === "light" ? "🌕" : "🔆"}
      <span className="sr-only">Переключить тему</span>
    </button>
  )
}