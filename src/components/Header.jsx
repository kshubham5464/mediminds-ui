import React from 'react'
import ThemeToggle from './ThemeToggle'

const Header = ({ title = "Hospital EMR System" }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center mr-3 transition-colors duration-300">
              <span className="text-gray-700 dark:text-gray-300 font-bold text-sm">EMR</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
