import React, { createContext, useContext, useState, useEffect } from 'react'
import { fetchPatientByAbhaId } from '../services/patientApi'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [abhaId, setAbhaId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For demo purposes, do not persist user session
    setLoading(false)
  }, [])

  const login = async (abhaIdParam) => {
    try {
      // Fetch patient data from API
      const result = await fetchPatientByAbhaId(abhaIdParam);
      if (result.success) {
        const patientData = result.data;
        // Set user as patient data
        const userData = {
          ...patientData,
          role: 'patient',
          loginTime: new Date().toISOString()
        };
        setUser(userData);
        setAbhaId(abhaIdParam);
        return { success: true, user: userData };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  const refresh = async () => {
    if (abhaId) {
      const result = await fetchPatientByAbhaId(abhaId);
      if (result.success) {
        const patientData = result.data;
        const userData = {
          ...patientData,
          role: 'patient',
          loginTime: new Date().toISOString()
        };
        setUser(userData);
      }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('emr_user')
  }

  const value = {
    user,
    login,
    logout,
    refresh,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}