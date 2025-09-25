import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PatientDetails from '../components/PatientDetails'
import { Users, FileText, TrendingUp, Activity, Upload, Search, Bell, Settings, Menu, X, Stethoscope, Clipboard, Heart, Calendar, Shield } from 'lucide-react'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalBundles: 0,
    recentRegistrations: 0,
    systemStatus: 'online'
  })
  const [loadingStats, setLoadingStats] = useState(true)

  // Load dashboard stats
  useEffect(() => {
    setLoadingStats(true)
    const patients = JSON.parse(localStorage.getItem('patients') || '[]')
    const bundles = JSON.parse(localStorage.getItem('fhirBundles') || '[]')

    // Calculate recent registrations (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentPatients = patients.filter(p => new Date(p.registrationDate) > sevenDaysAgo)

    setStats({
      totalPatients: patients.length,
      totalBundles: bundles.length,
      recentRegistrations: recentPatients.length,
      systemStatus: 'online'
    })
    setLoadingStats(false)
  }, [])

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const patients = JSON.parse(localStorage.getItem('patients') || '[]')
      const bundles = JSON.parse(localStorage.getItem('fhirBundles') || '[]')

      const patientResults = patients.filter(patient =>
        patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phoneNumber?.includes(searchTerm) ||
        patient.abhaId?.includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5).map(patient => ({
        type: 'patient',
        id: patient.id,
        title: `${patient.firstName} ${patient.lastName}`,
        subtitle: `Phone: ${patient.phoneNumber}`,
        details: `ABHA: ${patient.abhaId}`,
        icon: Users
      }))

      const bundleResults = bundles.filter(bundle =>
        bundle.resourceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bundle.id?.includes(searchTerm)
      ).slice(0, 3).map(bundle => ({
        type: 'bundle',
        id: bundle.id,
        title: bundle.resourceType || 'FHIR Bundle',
        subtitle: `ID: ${bundle.id}`,
        details: `${bundle.entry?.length || 0} entries`,
        icon: FileText
      }))

      setSearchResults([...patientResults, ...bundleResults])
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchTerm])

  const sections = [
    { id: 'overview', name: 'Dashboard', icon: '🏥', isTab: true },
    { id: 'patient-registration', name: 'Patient Details', icon: '👤', isTab: true },
    { id: 'mapping-tool', name: 'Code Mapping', icon: '🔄', route: '/mapping-tool' },
    { id: 'data-analytics', name: 'Analytics', icon: '📈', route: '/data-analytics' },
    { id: 'record-viewing', name: 'Patient Records', icon: '📋', route: '/record-viewing' },
    { id: 'upload-csv', name: 'Data Upload', icon: '📤', route: '/upload-csv' },
  ]

  const quickActions = [
    { name: 'New Patient', icon: Users, action: () => setActiveTab('patient-registration') },
    { name: 'Code Mapping', icon: Stethoscope, action: () => window.location.href = '/mapping-tool' },
    { name: 'Patient Records', icon: Clipboard, action: () => window.location.href = '/record-viewing' },
    { name: 'Analytics', icon: TrendingUp, action: () => window.location.href = '/data-analytics' },
  ]

  const recentActivities = [
    { type: 'patient', message: 'New patient registered', time: '2 hours ago', icon: Users },
    { type: 'upload', message: 'CSV data uploaded successfully', time: '4 hours ago', icon: Upload },
    { type: 'mapping', message: 'Code mapping completed', time: '1 day ago', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        .medical-gradient {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }
        .card-shadow {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
        }
        .hover-lift:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="h-8 w-8 bg-gray-100 border border-gray-300 rounded flex items-center justify-center mr-3">
                <span className="text-gray-700 font-bold text-sm">EMR</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Hospital EMR System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600">Welcome, {user?.firstName} {user?.lastName}</span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {sections.map((section) => (
              section.route ? (
                <Link
                  key={section.id}
                  to={section.route}
                  className="flex items-center px-3 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                >
                  <span className="mr-2 text-lg">{section.icon}</span>
                  {section.name}
                </Link>
              ) : (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === section.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2 text-lg">{section.icon}</span>
                  {section.name}
                </button>
              )
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="px-4 py-6 space-y-4">
            {sections.map((section) => (
              section.route ? (
                <Link 
                  key={section.id}
                  to={section.route}
                  onClick={() => setSidebarOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md"
                >
                  <span className="mr-2 text-lg">{section.icon}</span>
                  {section.name}
                </Link>
              ) : (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveTab(section.id)
                    setSidebarOpen(false)
                  }}
                  className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                    activeTab === section.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2 text-lg">{section.icon}</span>
                  {section.name}
                </button>
              )
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Good morning,  {user?.firstName} {user?.lastName}</h2>
                  <p className="text-gray-600">Ready to provide excellent patient care today?</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Heart className="h-4 w-4 mr-1 text-red-500" />
                      {stats.totalPatients} Active Patients
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                      {stats.recentRegistrations} New This Week
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-full">
                    {loadingStats ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    ) : (
                      <Users className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-700">Total Patients</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {loadingStats ? '...' : stats.totalPatients}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-full">
                    {loadingStats ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    ) : (
                      <FileText className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-700">FHIR Bundles</p>
                    <p className="text-2xl font-bold text-green-900">
                      {loadingStats ? '...' : stats.totalBundles}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-full">
                    {loadingStats ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                    ) : (
                      <Activity className="h-6 w-6 text-orange-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-700">Recent Registrations</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {loadingStats ? '...' : stats.recentRegistrations}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full border-2 ${stats.systemStatus === 'online' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    {loadingStats ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                    ) : (
                      <div className={`h-3 w-3 rounded-full ${stats.systemStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-700">System Status</p>
                    <p className="text-sm font-bold text-gray-900 capitalize">
                      {loadingStats ? 'Loading...' : stats.systemStatus}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-blue-700 p-4 rounded-lg hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all duration-200 flex flex-col items-center shadow-sm hover:shadow-md"
                    >
                      <action.icon className="h-6 w-6 mb-2 text-blue-600" />
                      <span className="text-sm font-medium">{action.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="p-2 bg-white border border-gray-200 rounded-full shadow-sm">
                        <activity.icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <input
                      type="text"
                      placeholder="Search patients, records, or data..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                      onFocus={() => searchTerm && setShowSearchResults(true)}
                      className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                    />
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                        {searchResults.map((result, index) => (
                          <div
                            key={`${result.type}-${result.id}-${index}`}
                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              if (result.type === 'patient') {
                                window.location.href = `/record-viewing?id=${result.id}`
                              } else {
                                // Handle bundle click - could navigate to bundle details
                                console.log('Bundle clicked:', result.id)
                              }
                              setShowSearchResults(false)
                              setSearchTerm('')
                            }}
                          >
                            <div className="p-2 bg-blue-50 rounded-full mr-3">
                              <result.icon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{result.title}</p>
                              <p className="text-xs text-gray-600">{result.subtitle}</p>
                              <p className="text-xs text-gray-500">{result.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 shadow-sm hover:shadow-md transition-all duration-200">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border">
            <PatientDetails />
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard