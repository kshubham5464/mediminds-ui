import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const PatientDetails = () => {
  const { user, logout, refresh } = useAuth()

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const PatientDetailView = ({ patient }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Name:</span> {patient.firstName} {patient.lastName}</div>
            <div><span className="font-medium">Gender:</span> {patient.gender}</div>
            <div><span className="font-medium">Date of Birth:</span> {formatDate(patient.dateOfBirth)}</div>
            <div><span className="font-medium">Phone:</span> {patient.phoneNumber}</div>
            {patient.email && <div><span className="font-medium">Email:</span> {patient.email}</div>}
            <div><span className="font-medium">ABHA ID:</span> {patient.abhaId}</div>
            <div><span className="font-medium">Marital Status:</span> {patient.maritalStatus}</div>
            <div><span className="font-medium">Occupation:</span> {patient.occupation}</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Medical Information</h4>
          <div className="space-y-2 text-sm">
            {patient.bloodGroup && <div><span className="font-medium">Blood Group:</span> {patient.bloodGroup}</div>}
            {patient.height && <div><span className="font-medium">Height:</span> {patient.height} cm</div>}
            {patient.weight && <div><span className="font-medium">Weight:</span> {patient.weight} kg</div>}
            {patient.allergies && (
              <div>
                <span className="font-medium">Allergies:</span>
                <p className="text-gray-700 mt-1">{patient.allergies}</p>
              </div>
            )}
            {patient.currentMedications && (
              <div>
                <span className="font-medium">Current Medications:</span>
                <p className="text-gray-700 mt-1">{patient.currentMedications}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {patient.address && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Address</h4>
          <p className="text-sm text-gray-700">
            {patient.address}, {patient.city}, {patient.state} - {patient.pincode}
          </p>
        </div>
      )}

      {patient.emergencyContactName && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Emergency Contact</h4>
          <p className="text-sm text-gray-700">
            {patient.emergencyContactName} ({patient.emergencyContactRelation}) - {patient.emergencyContactPhone}
          </p>
        </div>
      )}

      {patient.medicalHistory && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Medical History</h4>
          <p className="text-sm text-gray-700">{patient.medicalHistory}</p>
        </div>
      )}

      {patient.insuranceProvider && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Insurance</h4>
          <p className="text-sm text-gray-700">
            {patient.insuranceProvider} - Policy: {patient.insurancePolicyNumber}
          </p>
        </div>
      )}

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Registration</h4>
        <p className="text-sm text-gray-700">Registered on: {formatDate(patient.registrationDate)}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-light-gray to-medical-light-blue p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Details</h2>
        <p className="text-gray-600">Your patient information retrieved via ABHA ID.</p>
      </div>

      {user ? (
        <div className="space-y-6">
          <div className="bg-white/90 border border-gray-100 rounded-xl shadow-sm backdrop-blur-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Patient: {user.firstName} {user.lastName}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={refresh}
                  className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
                >
                  Refresh
                </button>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
            <PatientDetailView patient={user} />
          </div>
        </div>
      ) : (
        <div className="bg-white/90 border border-gray-100 rounded-xl shadow-sm backdrop-blur-sm p-6">
          <p className="text-gray-600">Please log in to view patient details.</p>
        </div>
      )}
    </div>
  )
}

export default PatientDetails
