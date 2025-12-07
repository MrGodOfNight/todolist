"use client"

import { useAuth } from "@/_contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm()
{
  const { login } = useAuth();
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('login');
  
  // Состояния для авторизации
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Состояния для регистрации
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Логика авторизации
    await login(loginEmail, loginPassword);
    router.push('/') // Перенаправление на главную страницу после успешной авторизации
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    const status = await fetch(`${apiUrl}/api/Auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: registerEmail,
        password: registerPassword,
      }),
    }).then(res => res.status)

    if (status === 200) {
      // Логика авторизации
      await login(registerEmail, registerPassword);
      router.push('/') // Перенаправление на главную страницу после успешной авторизации
    } else {
      alert('Не получилось зарегистрироваться')
    }
   
  };
  
  return (
    <div className="container mx-auto px-4">
      <section className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden
      border border-gray-200 dark:border-gray-700">
        <div className="p-6 bg-blue-600 dark:bg-gray-700">
          <h1 className="text-2xl font-bold text-white text-center">Авторизация/Регистрация</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Переключатель между авторизацией и регистрацией */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'login' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : `bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                  hover:bg-gray-200 dark:hover:bg-gray-600`
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'register' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : `bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                  hover:bg-gray-200 dark:hover:bg-gray-600`
              }`}
            >
              Регистрация
            </button>
          </div>

          {/* Форма авторизации */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email или логин
                </label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none 
                  text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Введите ваш email или логин"
                  aria-label="Email или логин"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Пароль
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none 
                  text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Введите ваш пароль"
                  aria-label="Пароль"
                />
              </div>

              <button
                onClick={handleLogin}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl
                transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2
                focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Войти в аккаунт
              </button>
            </div>
          )}

          {/* Форма регистрации */}
          {activeTab === 'register' && (
            <div className="space-y-4">

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email или логин
                </label>
                <input
                  type="text"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none 
                  text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Введите ваш email или логин"
                  aria-label="Email или логин"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Пароль
                </label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none 
                  text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Введите пароль"
                  aria-label="Пароль"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Подтверждение пароля
                </label>
                <input
                  type="password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none 
                  text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Подтвердите пароль"
                  aria-label="Подтверждение пароля"
                />
              </div>

              <button
                onClick={handleRegister}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl
                transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2
                focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Создать аккаунт
              </button>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg
          border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
              {activeTab === 'login' 
                ? 'Нет аккаунта? Переключитесь на вкладку "Регистрация", чтобы создать новый аккаунт.'
                : 'Уже есть аккаунт? Переключитесь на вкладку "Вход", чтобы войти в существующий аккаунт.'
              }
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}