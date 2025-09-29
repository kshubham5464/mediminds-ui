import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'

const ThemeToggleFancy = () => {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <button
      onClick={toggleDarkMode}
      className={`group relative inline-flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        darkMode
          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25'
          : 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/25'
      } hover:scale-105 active:scale-95`}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative">
        <Sun
          className={`h-6 w-6 transition-all duration-300 ${
            darkMode
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100 text-yellow-900'
          }`}
        />
        <Moon
          className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
            darkMode
              ? 'rotate-0 scale-100 opacity-100 text-indigo-100'
              : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
      <span className="sr-only">Toggle dark mode</span>
    </button>
  )
}

export default ThemeToggleFancy
