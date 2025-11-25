"use client"

import { applyTheme } from "@/_layouts/ThemeLayout";
import { useAuth } from "@/_contexts/AuthContext";
import { useState } from "react";

export default function SettingsClient() {
  const { logout } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isRussian, setIsRussian] = useState(true);
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  const toggleLanguage = () => {
    setIsRussian(prev => !prev);
    // Здесь можно добавить логику смены языка
  };
  return (
    <div className="container mx-auto px-4">
      <section className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden
      border border-gray-200 dark:border-gray-700">
        <div className="p-6 bg-blue-600 dark:bg-gray-700">
          <h1 className="text-2xl font-bold text-white text-center">Настройки</h1>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Внешний вид</h2>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 
            rounded-xl border border-gray-200 dark:border-gray-600">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Темная тема</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {theme === "dark" ? 'Темная тема включена' : 'Светлая тема включена'}
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={theme === "dark"}
                  onChange={toggleTheme}
                  aria-label="Переключить тему"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
                dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full
                peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white
                after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                dark:border-gray-600 peer-checked:bg-blue-600"/>
              </label>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Язык</h2>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 
            rounded-xl border border-gray-200 dark:border-gray-600">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Русский язык</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isRussian ? 'Интерфейс на русском' : 'Interface in English'}
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isRussian}
                  onChange={toggleLanguage}
                  aria-label="Переключить язык интерфейса"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
                dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full
                peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white
                after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                dark:border-gray-600 peer-checked:bg-blue-600"/>
              </label>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg
          border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
              Настройки сохраняются автоматически при изменении
            </p>
          </div>

          <button
                onClick={logout}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl
                transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2
                focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Выйти из аккаунта
              </button>
        </div>
      </section>
    </div>
  );
}