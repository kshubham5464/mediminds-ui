import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-gradient-to-br from-medical-light-blue to-medical-light-green flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-2xl">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Hospital EMR System</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in with your ABHA ID</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="abhaId" className="block text-sm font-medium text-gray-700">
                ABHA ID
              </label>
              <input
                id="abhaId"
                name="abhaId"
                type="text"
                required
                value={abhaId}
                onChange={handleAbhaIdChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-medical-light-teal focus:border-medical-light-teal"
                placeholder="XX-XXXX-XXXX-XXXX"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter your 14-digit ABHA ID (Ayushman Bharat Health Account)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to the terms of service and privacy policy of the Hospital EMR System.
            </p>
          </div>
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