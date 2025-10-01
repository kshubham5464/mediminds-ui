import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Home, Search, Upload, FileText, Code, ChevronDown, ChevronUp, AlertCircle, CheckCircle, X, Loader } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : 'https://mediminds.up.railway.app';

const MappingTool = () => {
  const { user } = useAuth()
  const [searchType, setSearchType] = useState('namaste')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCodes, setSelectedCodes] = useState([])
  const [namasteCodes, setNamasteCodes] = useState([])
  const [icdCodes, setIcdCodes] = useState([])
  const [diseaseMappings, setDiseaseMappings] = useState([])
  const [loadingCodes, setLoadingCodes] = useState(true)
  const [generatingFHIR, setGeneratingFHIR] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [patientDetailsExpanded, setPatientDetailsExpanded] = useState(true)
  const [selectedCodesExpanded, setSelectedCodesExpanded] = useState(true)
  const [mappingResultsExpanded, setMappingResultsExpanded] = useState(true)
  const debounceRef = useRef(null)

  const showNotification = (type, message) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const downloadText = (filename, content) => {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingCodes(true)
      try {
        const fetchNamasteCodes = async () => {
          const response = await fetch(`${API_BASE}/api/namaste`)
          const data = await response.json()
          setNamasteCodes(data.map(item => ({
            code: item.code,
            display: item.term,
            term: item.term,
            diacritical: item.diacritical,
            devanagari: item.devanagari,
            definition: item.shortDefinition || item.definition,
            disease: item.disease,
            nameEnglish: item.nameEnglish,
            shortDefinition: item.shortDefinition,
            system: 'NAMASTE'
          })))
        }

        const fetchICDCodes = async () => {
          const response = await fetch(`${API_BASE}/api/icd`)
          const data = await response.json()
          setIcdCodes(data.map(item => ({
            code: item.code,
            display: item.term,
            term: item.term,
            disease: item.disease,
            shortDefinition: item.shortDefinition,
            system: 'ICD'
          })))
        }

        const fetchDiseaseMappings = async () => {
          const response = await fetch(`${API_BASE}/api/disease-mappings`)
          const data = await response.json()
          setDiseaseMappings(data)
        }

        await Promise.all([fetchNamasteCodes(), fetchICDCodes(), fetchDiseaseMappings()])
      } catch (error) {
        console.error('Error fetching data:', error)
        showNotification('error', 'Failed to load codes and mappings')
        setNamasteCodes([])
        setIcdCodes([])
        setDiseaseMappings([])
      } finally {
        setLoadingCodes(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (searchTerm.trim()) {
        searchCodes()
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchTerm, searchType, namasteCodes, icdCodes])

  const searchCodes = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)

    try {
      // Filter codes based on search type
      const codesToSearch = searchType === 'namaste' ? namasteCodes : icdCodes
      const filteredCodes = codesToSearch.filter(code =>
        (code.disease && code.disease.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (code.display && code.display.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (code.code && code.code.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setSearchResults(filteredCodes)
    } catch (error) {
      console.error('Error searching codes:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const generateMappedResults = () => {
    if (searchType === 'namaste') {
      return selectedCodes.map(code => {
        const mapping = diseaseMappings.find(m => m.namaste.NAMC_CODE === code.code)
        return mapping ? {
          namaste: mapping.namaste,
          tm2: mapping.tm2,
          biomedicine: mapping.biomedicine
        } : {
          namaste: code,
          tm2: { code: 'No match', display: 'No TM2 mapping found' },
          biomedicine: { code: 'No match', display: 'No biomedicine mapping found' }
        }
      })
    } else {
      return selectedCodes.flatMap(code => {
        const mappings = diseaseMappings.filter(m => m.biomedicine.code === code.code)
        if (mappings.length > 0) {
          return mappings.map(mapping => ({
            namaste: mapping.namaste,
            tm2: mapping.tm2,
            biomedicine: mapping.biomedicine
          }))
        } else {
          return [{
            namaste: { NAMC_CODE: 'No match', NAMC_term: 'No Namaste mapping found' },
            tm2: { code: 'No match', display: 'No TM2 mapping found' },
            biomedicine: code
          }]
        }
      })
    }
  }

  const generateFHIRBundle = () => {
    if (selectedCodes.length === 0) {
      alert('Please select at least one code')
      return null
    }

    const patient = user
    const mappedResults = generateMappedResults()

    const fhirBundle = {
      resourceType: 'Bundle',
      id: `bundle-${Date.now()}`,
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: `Patient/${patient.abhaId}`,
          resource: {
            resourceType: 'Patient',
            id: patient.abhaId,
            identifier: patient.abhaId ? [{
              system: 'https://healthid.ndhm.gov.in',
              value: patient.abhaId
            }] : [],
            name: [{
              family: patient.lastName,
              given: [patient.firstName]
            }],
            gender: patient.gender,
            birthDate: patient.dateOfBirth,
            telecom: [
              {
                system: 'phone',
                value: patient.phoneNumber
              },
              ...(patient.email ? [{
                system: 'email',
                value: patient.email
              }] : [])
            ]
          }
        },
        ...mappedResults.map((mapping, index) => ({
          fullUrl: `Condition/${patient.abhaId}-${index}`,
          resource: {
            resourceType: 'Condition',
            id: `${patient.abhaId}-${index}`,
            subject: {
              reference: `Patient/${patient.abhaId}`
            },
            code: {
              coding: [
                {
                  system: 'http://namaste.terminology.system',
                  code: mapping.namaste.NAMC_CODE,
                  display: mapping.namaste.NAMC_term
                },
                {
                  system: 'http://tm2.terminology.system',
                  code: mapping.tm2.code,
                  display: mapping.tm2.display
                },
                {
                  system: 'http://biomedicine.terminology.system',
                  code: mapping.biomedicine.code,
                  display: mapping.biomedicine.display
                }
              ]
            },
            clinicalStatus: {
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'active'
              }]
            },
            note: [{
              text: mapping.namaste.Disease || 'Unknown Disease'
            }],
            recordedDate: new Date().toISOString()
          }
        }))
      ]
    }

    return fhirBundle
  }

  const handleGenerateFHIR = async () => {
    if (!confirm('Generate FHIR bundle from selected codes?')) return

    const bundle = generateFHIRBundle()
    if (bundle) {
      setGeneratingFHIR(true)
      try {
        const response = await fetch(`${API_BASE}/api/upload/fhir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bundle)
        })
        if (response.ok) {
          showNotification('success', 'FHIR Bundle generated and uploaded successfully!')
          setSelectedCodes([])
        } else {
          const error = await response.json()
          showNotification('error', 'Error uploading FHIR Bundle: ' + error.error)
        }
      } catch (error) {
        console.error('Error:', error)
        showNotification('error', 'Error uploading FHIR Bundle')
      } finally {
        setGeneratingFHIR(false)
      }
    }
  }

  const generateNamasteCodeSystem = () => {
    const codeSystem = {
      resourceType: 'CodeSystem',
      id: 'namaste-codesystem',
      url: 'http://namaste.terminology.system',
      version: '1.0.0',
      name: 'NAMASTE',
      title: 'NAMASTE Traditional Medicine Codes',
      status: 'active',
      content: 'complete',
      concept: namasteCodes.map(code => ({
        code: code.code,
        display: code.display || code.term,
        definition: code.definition || code.shortDefinition
      }))
    }
    const json = JSON.stringify(codeSystem, null, 2)
    downloadText(`namaste-codesystem-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`, json)
    showNotification('success', 'NAMASTE CodeSystem downloaded')
  }

  const generateICDCodeSystem = () => {
    const codeSystem = {
      resourceType: 'CodeSystem',
      id: 'icd11-codesystem',
      url: 'http://icd11.terminology.system',
      version: '1.0.0',
      name: 'ICD11',
      title: 'ICD-11 Codes with Biomedicine Mappings',
      status: 'active',
      content: 'complete',
      concept: icdCodes.map(code => ({
        code: code.code,
        display: code.display || code.term,
        definition: code.definition || code.shortDefinition
      }))
    }
    const json = JSON.stringify(codeSystem, null, 2)
    downloadText(`icd-codesystem-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`, json)
    showNotification('success', 'ICD CodeSystem downloaded')
  }

  const generateConceptMap = () => {
    const conceptMap = {
      resourceType: 'ConceptMap',
      id: 'namaste-to-icd11-conceptmap',
      url: 'http://namaste-to-icd11.mapping.system',
      version: '1.0.0',
      name: 'NAMASTEtoICD11',
      title: 'NAMASTE to ICD-11 Concept Map',
      status: 'active',
      sourceUri: 'http://namaste.terminology.system',
      targetUri: 'http://icd11.terminology.system',
      group: [{
        source: 'http://namaste.terminology.system',
        target: 'http://icd11.terminology.system',
        element: diseaseMappings.map(mapping => ({
          code: mapping.namaste.NAMC_CODE,
          target: [{
            code: mapping.biomedicine.code,
            equivalence: 'equivalent'
          }]
        }))
      }]
    }
    const json = JSON.stringify(conceptMap, null, 2)
    downloadText(`conceptmap-namaste-icd11-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`, json)
    showNotification('success', 'ConceptMap downloaded')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-light-gray to-medical-light-blue">
      {/* Notifications */}
      {notifications.map(notification => (
        <div key={notification.id} className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-md border ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} flex items-center`}>
          {notification.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
          {notification.message}
          <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))} className="ml-4">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Medical Code Mapping</h1>
                  <p className="text-gray-600">Map traditional medicine codes to standardized medical terminology</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg shadow-sm border border-blue-200 text-blue-800">
                <span className="text-sm text-gray-600">Doctor Portal</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-sm">NAMASTE Codes: {namasteCodes.length}</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-800 text-sm">ICD Codes: {icdCodes.length}</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-sm">Mappings: {diseaseMappings.length}</span>
        </div>

        {loadingCodes && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
            Loading code sets...
          </div>
        )}

      {user && (
        <div className="bg-white/90 border border-gray-100 rounded-xl shadow-sm backdrop-blur-sm mb-6">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
            <button onClick={() => setPatientDetailsExpanded(!patientDetailsExpanded)} className="text-gray-500 hover:text-gray-700">
              {patientDetailsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
          {patientDetailsExpanded && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 text-sm text-gray-900">{user.gender || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Type</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Choose the type of codes to search"
            >
              <option value="namaste">NAMASTE Codes</option>
              <option value="icd">ICD Codes</option>
            </select>
          </div>
          <div className="flex-2 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Term</label>
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${searchType.toUpperCase()} codes...`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Enter search term for codes"
              />
              <button
                onClick={searchCodes}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
                title="Search for codes"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {searchTerm.trim().length > 0 && searchResults.length === 0 && !loading && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          No results found. Try a different term or switch search type.
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Search Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((code, index) => {
              const isSelected = selectedCodes.some(selected => selected.code === code.code)
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedCodes(selectedCodes.filter(selected => selected.code !== code.code))
                    } else {
                      setSelectedCodes([...selectedCodes, code])
                    }
                  }}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors transition-transform hover:translate-y-0.5 ${
                    isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Disease</label>
                      <p className="text-sm text-gray-900">{code.disease || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Code</label>
                      <p className="text-sm font-mono text-green-600">{code.code}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Term</label>
                      <p className="text-sm text-gray-900">{code.term}</p>
                    </div>
                    {searchType === 'namaste' && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Devanagari</label>
                          <p className="text-sm text-gray-900">{code.devanagari || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Name English</label>
                          <p className="text-sm text-gray-900">{code.nameEnglish || 'N/A'}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="text-xs font-medium text-gray-500">Short Definition</label>
                      <p className="text-sm text-gray-900">{code.shortDefinition || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      isSelected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isSelected ? 'Selected' : 'Click to Select'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {selectedCodes.length > 0 && (
        <div className="bg-white/90 border border-gray-100 rounded-xl shadow-sm backdrop-blur-sm mb-6">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Selected Codes ({selectedCodes.length})</h3>
            <div className="flex items-center space-x-2">
              <button onClick={() => setSelectedCodes([])} className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700" title="Clear all selected codes">
                Clear All
              </button>
              <button onClick={() => setSelectedCodesExpanded(!selectedCodesExpanded)} className="text-gray-500 hover:text-gray-700">
                {selectedCodesExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {selectedCodesExpanded && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCodes.map((code, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm font-mono text-green-600">{code.code}</p>
                    <p className="text-xs text-gray-600 mt-1">{code.display}</p>
                    <button
                      onClick={() => setSelectedCodes(selectedCodes.filter((_, i) => i !== index))}
                      className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      title="Remove this code"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedCodes.length > 0 && (
        <div className="bg-white/90 border border-gray-100 rounded-xl shadow-sm backdrop-blur-sm mb-6">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Code Mapping Results</h3>
            <button onClick={() => setMappingResultsExpanded(!mappingResultsExpanded)} className="text-gray-500 hover:text-gray-700">
              {mappingResultsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
          {mappingResultsExpanded && (
            <div className="p-6">
              <div className="space-y-4">
                {generateMappedResults().map((mapping, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded">
                        <h4 className="font-semibold text-green-800 mb-2">NAMASTE</h4>
                        <p className="text-sm font-mono text-green-600">{mapping.namaste.NAMC_CODE}</p>
                        <p className="text-xs text-gray-600 mt-1">NAMC Term: {mapping.namaste.NAMC_term}</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <h4 className="font-semibold text-blue-800 mb-2">TM2</h4>
                        <p className="text-sm font-mono text-blue-600">{mapping.tm2.code}</p>
                        <p className="text-xs text-gray-600 mt-1">{mapping.tm2.display}</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <h4 className="font-semibold text-purple-800 mb-2">Biomedicine</h4>
                        <p className="text-sm font-mono text-purple-600">{mapping.biomedicine.code}</p>
                        <p className="text-xs text-gray-600 mt-1">ICD Term: {mapping.biomedicine.display}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={handleGenerateFHIR}
                  disabled={generatingFHIR}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 flex items-center"
                  title="Generate FHIR bundle from selected codes"
                >
                  {generatingFHIR ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {generatingFHIR ? 'Generating...' : 'Generate FHIR Bundle'}
                </button>
                <button
                  onClick={generateNamasteCodeSystem}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                  title="Generate NAMASTE CodeSystem"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Generate NAMASTE CodeSystem
                </button>
                <button
                  onClick={generateICDCodeSystem}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  title="Generate ICD CodeSystem"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Generate ICD CodeSystem
                </button>
                <button
                  onClick={generateConceptMap}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center"
                  title="Generate ConceptMap between NAMASTE and ICD"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate ConceptMap
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      </div>
    </div>
  )
}

export default MappingTool
