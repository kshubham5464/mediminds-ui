import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts'

const DataAnalytics = () => {
  const [patients, setPatients] = useState([])
  const [fhirBundles, setFhirBundles] = useState([])
  const [analytics, setAnalytics] = useState({
    totalPatients: 0,
    totalConditions: 0,
    mostCommonConditions: [],
    genderDistribution: {},
    ageDistribution: {},
    registrationTrend: []
  })

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  useEffect(() => {
    loadAnalyticsData()

    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadAnalyticsData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  const loadAnalyticsData = () => {
    const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]')
    const storedBundles = JSON.parse(localStorage.getItem('fhirBundles') || '[]')

    setPatients(storedPatients)
    setFhirBundles(storedBundles)

    // Calculate analytics
    const totalPatients = storedPatients.length
    const totalConditions = storedBundles.reduce((acc, bundle) => {
      return acc + (bundle.entry?.filter(entry => entry.resource?.resourceType === 'Condition').length || 0)
    }, 0)

    // Gender distribution
    const genderDistribution = storedPatients.reduce((acc, patient) => {
      acc[patient.gender] = (acc[patient.gender] || 0) + 1
      return acc
    }, {})

    // Age distribution (simplified)
    const currentYear = new Date().getFullYear()
    const ageDistribution = storedPatients.reduce((acc, patient) => {
      if (patient.dateOfBirth) {
        const age = currentYear - new Date(patient.dateOfBirth).getFullYear()
        const ageGroup = age < 18 ? 'Under 18' : age < 35 ? '18-34' : age < 50 ? '35-49' : age < 65 ? '50-64' : '65+'
        acc[ageGroup] = (acc[ageGroup] || 0) + 1
      }
      return acc
    }, {})

    // Most common conditions (from FHIR bundles)
    const conditionCounts = {}
    storedBundles.forEach(bundle => {
      bundle.entry?.forEach(entry => {
        if (entry.resource?.resourceType === 'Condition') {
          const codes = entry.resource.code?.coding || []
          codes.forEach(coding => {
            if (coding.system === 'http://namaste.terminology.system') {
              conditionCounts[coding.display] = (conditionCounts[coding.display] || 0) + 1
            }
          })
        }
      })
    })

    const mostCommonConditions = Object.entries(conditionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([condition, count]) => ({ condition, count }))

    // Registration trend (last 7 days) - using local dates
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
    })

    const registrationTrend = last7Days.map(date => ({
      date,
      count: storedPatients.filter(patient =>
        patient.registrationDate === date
      ).length
    }))

    setAnalytics({
      totalPatients,
      totalConditions,
      mostCommonConditions,
      genderDistribution,
      ageDistribution,
      registrationTrend
    })
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center">
        <Link
          to="/dashboard"
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Home className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Analytics</h2>
        <p className="text-gray-600">Overview of patient data and system usage analytics.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Conditions</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalConditions}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">FHIR Bundles</p>
              <p className="text-2xl font-semibold text-gray-900">{fhirBundles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Conditions/Patient</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.totalPatients > 0 ? (analytics.totalConditions / analytics.totalPatients).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          {Object.keys(analytics.genderDistribution).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics.genderDistribution).map(([name, value]) => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    value
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(analytics.genderDistribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No gender data available</p>
          )}
        </div>

        {/* Age Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
          {Object.keys(analytics.ageDistribution).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(analytics.ageDistribution).map(([ageGroup, count]) => ({ ageGroup, count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ageGroup" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No age data available</p>
          )}
        </div>

        {/* Most Common Conditions */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Conditions</h3>
          {analytics.mostCommonConditions.length > 0 ? (
            <div className="space-y-3">
              {analytics.mostCommonConditions.map(({ condition, count }, index) => (
                <div key={condition} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{index + 1}. {condition}</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No condition data available</p>
          )}
        </div>

        {/* Registration Trend */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Registration Trend (Last 7 Days)</h3>
          {analytics.registrationTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.registrationTrend.map(({ date, count }) => ({
                date: new Date(date).toLocaleDateString(),
                count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#FFBB28" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No registration data available</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={loadAnalyticsData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Refresh Analytics
        </button>
        <button
          onClick={() => {
            const data = { patients, fhirBundles, analytics }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `emr-analytics-${new Date().toISOString().split('T')[0]}.json`
            a.click()
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
        >
          Export Data
        </button>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all data? This will delete all patients, FHIR bundles, CodeSystems, and ConceptMaps.')) {
              localStorage.removeItem('patients')
              localStorage.removeItem('fhirBundles')
              localStorage.removeItem('codeSystems')
              localStorage.removeItem('conceptMaps')
              // Clear NAMASTE data from backend memory
              fetch('http://localhost:5000/api/reset', { method: 'POST' })
                .then(() => {
                  alert('All data has been reset successfully!')
                  loadAnalyticsData()
                })
                .catch(error => {
                  console.error('Error resetting backend data:', error)
                  alert('Frontend data reset successfully, but backend data may still exist.')
                  loadAnalyticsData()
                })
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
        >
          Reset All Data
        </button>
      </div>

      {analytics.totalPatients === 0 && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            No patient data available. Please register some patients first to see analytics.
          </p>
        </div>
      )}
    </div>
  )
}

export default DataAnalytics
