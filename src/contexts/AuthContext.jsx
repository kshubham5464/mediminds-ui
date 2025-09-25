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
    const savedUser = localStorage.getItem('emr_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        const loginTime = new Date(userData.loginTime)
        const now = new Date()
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60)

        if (hoursSinceLogin < 24) {
          setUser(userData)
          setAbhaId(userData.abhaId)
        } else {
          localStorage.removeItem('emr_user')
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('emr_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (abhaIdParam) => {
    try {
      const result = await fetchPatientByAbhaId(abhaIdParam);
      if (result.success) {
        const patientData = result.data;
        const userData = {
          ...patientData,
          role: 'patient',
          loginTime: new Date().toISOString()
        };
        setUser(userData);
        setAbhaId(abhaIdParam);
        localStorage.setItem('emr_user', JSON.stringify(userData));
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
        localStorage.setItem('emr_user', JSON.stringify(userData));
      }
    }
  }

  const logout = () => {
    setUser(null)
    setAbhaId(null)
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