import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import OTPModal from '../components/OTPModal'
import { Shield, Lock, User, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const DEMO_ABHA_ID = '12-3456-7890-1234'
  const [abhaId, setAbhaId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [showAbhaCode, setShowAbhaCode] = useState(false)
  const [inputVisible, setInputVisible] = useState(false)
  const { user, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && user.abhaId) {
      setAbhaId(user.abhaId)
    }
  }, [user])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-cyan-50/50 to-purple-50/50"></div>
      <div className="absolute top-20 left-10 w-40 h-40 bg-blue-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-cyan-200/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Description */}
          <motion.div
            className="space-y-6 lg:pr-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-4">
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-2 h-10 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  Unified AYUSH Terminology & Mobility Intelligence
                </h1>
              </motion.div>
              <motion.p
                className="text-lg text-gray-700 leading-relaxed max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Linked FHIR interoperability standard for research, clinical, and administrative purposes. 
                FHIR enables portability and seamless data exchange across healthcare systems.
              </motion.p>
            </div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-xl backdrop-blur-sm border border-white/30">
                <Shield className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">NAMASTE-ICD</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-xl backdrop-blur-sm border border-white/30">
                <Lock className="h-5 w-5 text-cyan-500" />
                <span className="text-sm font-medium text-gray-700">Standard & Authenticity</span>
              </div>
            </motion.div>

            <motion.div
              className="pt-6 border-t border-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="text-sm text-gray-600 flex items-center justify-center space-x-2">
                <span>Powered by</span>
                <span className="font-semibold text-blue-600">TEAM MediMinds</span>
              </p>
            </motion.div>
          </motion.div>

          {/* Right Panel - Login Form */}
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 lg:p-10 relative overflow-hidden"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-t-3xl"></div>
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-100/30 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-cyan-100/30 rounded-full blur-xl"></div>

            <div className="relative z-10 space-y-6">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Access ABHA Login Service
                </h2>
                <p className="text-gray-600">Enter your ABHA credentials to continue</p>
              </motion.div>

              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="space-y-2">
                  <label htmlFor="abhaId" className="block text-sm font-semibold text-gray-700">
                    ABHA ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="abhaId"
                      name="abhaId"
                      type={inputVisible ? "text" : "password"}
                      required
                      value={abhaId}
                      onChange={handleAbhaIdChange}
                      className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl text-lg font-mono tracking-wider placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm"
                      placeholder="XX-XXXX-XXXX-XXXX"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1.5 shadow-sm border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-md"
                      onClick={() => setInputVisible(!inputVisible)}
                    >
                      {inputVisible ? <EyeOff className="h-4 w-4 text-gray-600" /> : <Eye className="h-4 w-4 text-gray-600" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter your 14-digit ABHA ID (Ayushman Bharat Health Account)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="showAbhaCode"
                    type="checkbox"
                    checked={showAbhaCode}
                    onChange={(e) => {
                      setShowAbhaCode(e.target.checked)
                      if (e.target.checked) {
                        setAbhaId(DEMO_ABHA_ID)
                        setInputVisible(true)
                      } else {
                        setAbhaId('')
                        setInputVisible(false)
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showAbhaCode" className="text-sm text-gray-600 cursor-pointer">
                    Show Demo ABHA Codes
                  </label>
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
                  className={`w-full py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 hover:from-purple-600 hover:via-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 hover:shadow-xl'
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
                    <>
                      <Lock className="h-5 w-5" />
                      <span>Login with ABHA</span>
                    </>
                  )}
                </motion.button>

                <div className="text-center space-y-2">
                  <div className="text-xs text-gray-500">
                    By signing in, you agree to the terms of service and privacy policy.
                  </div>
                </div>
              </motion.form>
            </div>
          </motion.div>
        </div>
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
