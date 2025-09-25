import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

const RecordViewing = () => {
  const [patients, setPatients] = useState([])
  const [fhirBundles, setFhirBundles] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [viewMode, setViewMode] = useState('patient') // 'patient', 'fhir', or 'upload'
  const [searchTerm, setSearchTerm] = useState('')
  const [fhirFile, setFhirFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    try {
      const patientsRes = await fetch('http://65.2.124.178:5000/api/patients')
      const patients = await patientsRes.json()
      setPatients(patients)
      const bundlesRes = await fetch('http://65.2.124.178:5000/api/fhir-bundles')
      const bundles = await bundlesRes.json()
      setFhirBundles(bundles)
    } catch (error) {
      console.error('Error loading records:', error)
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.name?.toLowerCase().includes(searchLower) || // safe check
      patient.id?.toLowerCase().includes(searchLower) || // also normalize case
      patient.conditions?.some(
        (c) =>
          c.code.namaste?.toLowerCase().includes(searchLower) ||
          c.code.icd?.toLowerCase().includes(searchLower)
      )
    );
  });

  const getPatientBundles = (patient) => {
    return patient.bundleIds?.map(id => fhirBundles.find(b => b.id === id)).filter(Boolean) || []
  }

  const handleFhirIngest = () => {
    if (!fhirFile) {
      alert('Please select a FHIR JSON file to upload.')
      return
    }

    setLoading(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const bundle = JSON.parse(event.target.result)
        const response = await fetch('http://65.2.124.178:5000/api/upload/fhir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bundle)
        })
        if (response.ok) {
          alert('FHIR Bundle uploaded successfully!')
          loadRecords() // Refresh records
        } else {
          const error = await response.json()
          alert('Error uploading FHIR Bundle: ' + error.error)
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error processing file')
      } finally {
        setLoading(false)
      }
    }
    reader.readAsText(fhirFile)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const PatientDetailView = ({ patient }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Name:</span> {patient.name}</div>
            <div><span className="font-medium">Gender:</span> {patient.gender}</div>
            <div><span className="font-medium">Date of Birth:</span> {patient.birthDate}</div>
            <div><span className="font-medium">ID:</span> {patient.id}</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Conditions</h4>
          <div className="space-y-2 text-sm">
            {patient.conditions?.map((cond) => (
              <div key={cond.id || cond.code.namaste} className="border rounded p-2">
                <div>NAMC: {cond.code.namaste}</div>
                <div>ICD: {cond.code.icd}</div>
                <div>Display: {cond.display}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">FHIR Records</h4>
        <div className="space-y-2">
          {getPatientBundles(patient).map((bundle, index) => (
            <div key={bundle.id} className="bg-blue-50 p-3 rounded border">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Bundle {bundle.id}</p>
                  <p className="text-xs text-gray-600">{formatDate(bundle.timestamp)}</p>
                </div>
                <button
                  onClick={() => setSelectedRecord({ type: 'bundle', data: bundle })}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
          {getPatientBundles(patient).length === 0 && (
            <p className="text-sm text-gray-500">No FHIR records found for this patient</p>
          )}
        </div>
      </div>
    </div>
  )

  const FHIRBundleView = ({ bundle }) => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Bundle Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">ID:</span> {bundle.id}</div>
          <div><span className="font-medium">Type:</span> {bundle.type}</div>
          <div><span className="font-medium">Timestamp:</span> {formatDate(bundle.timestamp)}</div>
          <div><span className="font-medium">Entries:</span> {bundle.entry?.length || 0}</div>
        </div>
      </div>

      {bundle.entry?.map((entry, index) => (
        <div key={index} className="border rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 mb-2">
            {entry.resource?.resourceType} Resource
          </h5>

          {entry.resource?.resourceType === 'Patient' && (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">ID:</span> {entry.resource.id}</div>
              {entry.resource.name?.[0] && (
                <div>
                  <span className="font-medium">Name:</span> {' '}
                  {entry.resource.name[0].given?.join(' ')} {entry.resource.name[0].family}
                </div>
              )}
              {entry.resource.gender && (
                <div><span className="font-medium">Gender:</span> {entry.resource.gender}</div>
              )}
              {entry.resource.birthDate && (
                <div><span className="font-medium">Birth Date:</span> {entry.resource.birthDate}</div>
              )}
              {entry.resource.identifier?.[0] && (
                <div>
                  <span className="font-medium">ABHA ID:</span> {entry.resource.identifier[0].value}
                </div>
              )}
            </div>
          )}

          {entry.resource?.resourceType === 'Condition' && (
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Status:</span> {' '}
                {entry.resource.clinicalStatus?.coding?.[0]?.code || 'Unknown'}
              </div>

              <div>
                <span className="font-medium text-sm">Coded Diagnoses:</span>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {entry.resource.code?.coding?.map((coding, codingIndex) => (
                    <div key={codingIndex} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium text-gray-900">
                        {coding.system?.includes('namaste') ? 'NAMASTE' :
                         coding.system?.includes('icd') && coding.system?.includes('biomedicine') ? 'ICD Biomedicine' :
                         coding.system?.includes('icd') ? 'ICD-11' : 'TM2'}
                      </div>
                      <div className="font-mono text-blue-600">{coding.code}</div>
                      <div className="text-gray-600">{coding.display}</div>
                    </div>
                  ))}
                </div>
              </div>

              {entry.resource.recordedDate && (
                <div className="text-sm">
                  <span className="font-medium">Recorded:</span> {formatDate(entry.resource.recordedDate)}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Record Viewing</h2>
        <p className="text-gray-600">View and search patient records and FHIR bundles.</p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setViewMode('patient')}
          className={`px-4 py-2 rounded-md font-medium ${
            viewMode === 'patient'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Patient Records
        </button>
        <button
          onClick={() => setViewMode('fhir')}
          className={`px-4 py-2 rounded-md font-medium ${
            viewMode === 'fhir'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          FHIR Bundles
        </button>
        <button
          onClick={() => setViewMode('upload')}
          className={`px-4 py-2 rounded-md font-medium ${
            viewMode === 'upload'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Upload FHIR
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - List */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900 mb-2">
                {viewMode === 'patient' ? 'Patients' : viewMode === 'fhir' ? 'FHIR Bundles' : 'Upload FHIR'}
              </h3>
              {viewMode === 'patient' && (
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {viewMode === 'patient' ? (
                <>
                  {filteredPatients.map(patient => (
                    <div
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatient(patient.id)
                        setSelectedRecord({ type: 'patient', data: patient })
                      }}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedPatient === patient.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {patient.name}
                      </div>
                      <div className="text-xs text-gray-600">{patient.id}</div>
                    </div>
                  ))}
                  {filteredPatients.length === 0 && (
                    <p className="p-4 text-sm text-gray-500">No patients found</p>
                  )}
                </>
              ) : (
                <>
                  {fhirBundles.map((bundle, index) => (
                    <div
                      key={bundle.id}
                      onClick={() => setSelectedRecord({ type: 'bundle', data: bundle })}
                      className="p-3 border-b cursor-pointer hover:bg-gray-50"
                    >
                      <div className="font-medium text-sm">Bundle #{index + 1}</div>
                      <div className="text-xs text-gray-600">{formatDate(bundle.timestamp)}</div>
                      <div className="text-xs text-gray-500">
                        {bundle.entry?.length || 0} entries
                      </div>
                    </div>
                  ))}
                  {fhirBundles.length === 0 && (
                    <p className="p-4 text-sm text-gray-500">No FHIR bundles found</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-lg p-6">
            {viewMode === 'upload' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload FHIR Bundle</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select FHIR JSON File
                    </label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => setFhirFile(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <button
                    onClick={handleFhirIngest}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Uploading...' : 'Upload FHIR Bundle'}
                  </button>
                </div>
              </div>
            ) : selectedRecord ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedRecord.type === 'patient' ? 'Patient Details' : 'FHIR Bundle Details'}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const data = selectedRecord.data
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${selectedRecord.type}-${data.id || Date.now()}.json`
                        a.click()
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => setSelectedRecord(null)}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {selectedRecord.type === 'patient' ? (
                  <PatientDetailView patient={selectedRecord.data} />
                ) : (
                  <FHIRBundleView bundle={selectedRecord.data} />
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No record selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a {viewMode === 'patient' ? 'patient' : 'FHIR bundle'} from the list to view details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
          <div className="text-sm text-gray-600">Total Patients</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{fhirBundles.length}</div>
          <div className="text-sm text-gray-600">FHIR Bundles</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {fhirBundles.reduce((acc, bundle) => acc + (bundle.entry?.filter(e => e.resource?.resourceType === 'Condition').length || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Conditions</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {patients.reduce((acc, p) => acc + (p.conditions?.length || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Conditions</div>
        </div>
      </div>
    </div>
  )
}

export default RecordViewing
