import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <button
      onClick={toggleDarkMode}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        darkMode ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
          darkMode ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      <span className="sr-only">Toggle dark mode</span>
    </button>
  )
}

export default ThemeToggle
