"use client"

import { createContext, useContext, useEffect, useState } from "react"

// Интерфейс для контекста авторизации
interface AuthContextType {
  token: string | null
  login: (login: string, password: string) => void
  logout: () => void
}

// Создание контекста авторизации
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Провайдер контекста авторизации
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)

  // Эффект для проверки наличия сохраненного токена при загрузке
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  // Функция для входа пользователя
  const login = async (Login: string, Password: string) => {
    const authToken = await fetch(`https://localhost:7075/api/Auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: Login,
        password: Password,
      }),
    }).then(res => res.status === 200 ? res.text() : null)
    if(!authToken) {
      logout();
      alert('Неверный логин и/или пароль');
    }
    else{
      setToken(authToken)
      localStorage.setItem('token', authToken)
    }
  }

  // Функция для выхода пользователя
  const logout = () => {
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ token , login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Хук для использования контекста авторизации
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}