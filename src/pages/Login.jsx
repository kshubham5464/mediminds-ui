import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import OTPModal from '../components/OTPModal'

const Login = () => {
  const [abhaId, setAbhaId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate ABHA ID format
    if (abhaId.length < 17) {
      setError('Please enter a valid ABHA ID')
      setLoading(false)
      return
    }

    // Show OTP modal instead of direct login
    setShowOTPModal(true)
    setLoading(false)
  }

  const handleOTPVerify = async () => {
    const result = await login(abhaId)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
      setShowOTPModal(false)
    }
  }

  const formatAbhaId = (value) => {
    // Remove all non-numeric characters
    const cleanValue = value.replace(/\D/g, '')
    // Format as XX-XXXX-XXXX-XXXX
    return cleanValue.replace(/(\d{2})(\d{4})(\d{4})(\d{4})/, '$1-$2-$3-$4')
  }

  const handleAbhaIdChange = (e) => {
    const formatted = formatAbhaId(e.target.value)
    if (formatted.length <= 17) { // XX-XXXX-XXXX-XXXX = 17 characters
      setAbhaId(formatted)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-medical-light-blue/20 to-medical-light-teal/30 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-medical-light-blue/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-medical-light-teal/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-200/20 rounded-full blur-lg animate-pulse delay-500"></div>
      <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-medical-light-blue/5 rounded-full blur-2xl animate-pulse delay-700"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          className="max-w-lg w-full space-y-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Logo Section */}
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              className="mx-auto w-24 h-24 bg-gradient-to-br from-medical-light-blue via-medical-light-teal to-purple-400 rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-3xl font-black text-white tracking-wider">EMR</div>
                <div className="text-xs text-white/80 font-medium">SYSTEM</div>
              </div>
            </motion.div>
            <motion.h1
              className="text-4xl font-bold bg-gradient-to-r from-medical-light-blue via-medical-light-teal to-purple-500 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Electronic Medical Records
            </motion.h1>
            <motion.p
              className="text-lg text-gray-600 font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Secure Healthcare Management Platform
            </motion.p>
          </motion.div>

          <motion.div
            className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-medical-light-blue via-medical-light-teal to-purple-400"></div>
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-medical-light-blue/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-medical-light-teal/10 rounded-full blur-xl"></div>

            <div className="relative z-10">
              <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Please sign in to access your account</p>
              </motion.div>

              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="abhaId" className="block text-sm font-semibold text-gray-700 mb-2">
                      ABHA ID
                    </label>
                    <input
                      id="abhaId"
                      name="abhaId"
                      type="text"
                      required
                      value={abhaId}
                      onChange={handleAbhaIdChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-center text-lg font-mono tracking-wider placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-medical-light-teal focus:border-medical-light-teal transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm"
                      placeholder="XX-XXXX-XXXX-XXXX"
                    />
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      Enter your 14-digit ABHA ID (Ayushman Bharat Health Account)
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white transition-all duration-300 ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-medical-light-blue via-medical-light-teal to-purple-400 hover:from-purple-400 hover:via-medical-light-teal hover:to-medical-light-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-light-teal transform hover:scale-105 hover:shadow-xl'
                    }`}
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      'Sign in with ABHA ID'
                    )}
                  </motion.button>
                </div>
              </motion.form>

              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <p className="text-xs text-gray-500">
                  By signing in, you agree to the terms of service and privacy policy of the Hospital EMR System.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerify}
        abhaId={abhaId}
      />
    </div>
  )
}

export default Login
