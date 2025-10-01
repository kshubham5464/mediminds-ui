import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-white-900 to-white-900 text-black py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-medium">
          © 2024 Government of India, Ministry of Ayush. All rights reserved.
        </p>
        <p className="text-xs text-white-100 mt-2">
          This is an official platform of the Government of India. National AYUSH Terminology Platform.
        </p>
      </div>
    </footer>
  )
}

export default Footer
