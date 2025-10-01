import React from 'react'
import { motion } from 'framer-motion'

const sections = [
  {
    title: 'Health Check',
    color: 'from-green-50 to-green-100',
    items: [
      {
        method: 'GET',
        path: '/health',
        desc: 'Simple health check endpoint to verify the backend is running.',
        curl: 'curl -X GET "$BASE_URL/health"',
        response: `{
  "status": "ok",
  "timestamp": "2025-01-01T10:00:00.000Z"
}`
      }
    ]
  },
  {
    title: 'Terminology (NAMASTE & ICD)',
    color: 'from-blue-50 to-blue-100',
    items: [
      {
        method: 'GET',
        path: '/api/namaste',
        desc: 'Get all NAMASTE codes (loaded from uploaded CSV).',
        curl: 'curl -X GET "$BASE_URL/api/namaste"',
        response: `[
  {
    "disease": "Asthma",
    "code": "NAMC001",
    "term": "Asthma (TM)",
    "diacritical": "Asthmá",
    "devanagari": "अस्थमा",
    "nameEnglish": "Asthma",
    "shortDefinition": "A respiratory condition...",
    "system": "NAMASTE"
  }
]`
      },
      {
        method: 'GET',
        path: '/api/icd',
        desc: 'Get all ICD entries preloaded from icd.csv (biomedicine mappings).',
        curl: 'curl -X GET "$BASE_URL/api/icd"',
        response: `[
  {
    "disease": "Asthma",
    "code": "JB12",
    "term": "Asthma (ICD-11)",
    "shortDefinition": "A chronic inflammatory condition...",
    "system": "ICD"
  }
]`
      },
      {
        method: 'GET',
        path: '/api/disease-mappings',
        desc: 'Get mapping objects between NAMASTE, TM2, and Biomedicine.',
        curl: 'curl -X GET "$BASE_URL/api/disease-mappings"',
        response: `[
  {
    "namaste": { "NAMC_CODE": "NAMC001", "NAMC_term": "Asthma" },
    "tm2": { "code": "TM2001", "display": "Asthma TM2" },
    "biomedicine": { "code": "JB12", "display": "Asthma (ICD-11)" }
  }
]`
      }
    ]
  },
  {
    title: 'CSV Upload & Reset',
    color: 'from-teal-50 to-teal-100',
    items: [
      {
        method: 'POST',
        path: '/api/upload',
        desc: 'Upload and ingest NAMASTE CSV (multipart/form-data, field name: file). Saves to backend/namasteData.json.',
        curl: 'curl -X POST "$BASE_URL/api/upload" -F "file=@./namaste.csv"',
        response: `{
  "message": "CSV ingested successfully",
  "count": 1234
}`
      },
      {
        method: 'POST',
        path: '/api/reset',
        desc: 'Reset NAMASTE data – clears backend/namasteData.json and in-memory data.',
        curl: 'curl -X POST "$BASE_URL/api/reset"',
        response: `{
  "message": "All data has been reset successfully"
}`
      }
    ]
  },
  {
    title: 'Patient & FHIR',
    color: 'from-purple-50 to-purple-100',
    items: [
      {
        method: 'GET',
        path: '/api/patient/:abhaId',
        desc: 'Get mock patient by ABHA ID (pattern: XX-XXXX-XXXX-XXXX). Rate-limited and mock-mode gated.',
        curl: 'curl -X GET "$BASE_URL/api/patient/12-3456-7890-1234"',
        response: `{
  "abhaId": "12-3456-7890-1234",
  "firstName": "Amit",
  "lastName": "Sharma",
  "gender": "male",
  "dateOfBirth": "1985-03-15",
  ...
}`
      },
      {
        method: 'POST',
        path: '/api/upload/fhir',
        desc: 'Upload a FHIR Bundle (JSON). Stores bundle and updates patients.json, fhirBundles.json.',
        curl: 'curl -X POST "$BASE_URL/api/upload/fhir" -H "Content-Type: application/json" -d @bundle.json',
        response: `{
  "message": "FHIR Bundle uploaded successfully",
  "patientId": "12-3456-7890-1234"
}`
      },
      {
        method: 'GET',
        path: '/api/patients',
        desc: 'Get all patients aggregated from uploaded FHIR Bundles.',
        curl: 'curl -X GET "$BASE_URL/api/patients"',
        response: `[
  {
    "abhaId": "12-3456-7890-1234",
    "firstName": "Amit",
    "lastName": "Sharma",
    "conditions": [...],
    "bundleIds": ["bundle-..."],
    ...
  }
]`
      },
      {
        method: 'GET',
        path: '/api/fhir-bundles',
        desc: 'Get all uploaded FHIR Bundles.',
        curl: 'curl -X GET "$BASE_URL/api/fhir-bundles"',
        response: `[
  {
    "resourceType": "Bundle",
    "id": "bundle-...",
    "entry": [...]
  }
]`
      }
    ]
  },
  {
    title: 'Mappings (Derived)',
    color: 'from-amber-50 to-amber-100',
    items: [
      {
        method: 'GET',
        path: '/api/mappings',
        desc: 'Generate/read disease mappings (derived via createMapping).',
        curl: 'curl -X GET "$BASE_URL/api/mappings"',
        response: `[
  { "namaste": {...}, "tm2": {...}, "biomedicine": {...} }
]`
      },
      {
        method: 'GET',
        path: '/api/search-disease/:query',
        desc: 'Fuzzy search across derived mappings by disease string.',
        curl: 'curl -X GET "$BASE_URL/api/search-disease/asthma"',
        response: `{
  "namaste": {...},
  "tm2": {...},
  "biomedicine": {...}
}`
      }
    ]
  }
]

const Badge = ({ method }) => {
  const color = {
    GET: 'bg-emerald-100 text-emerald-800',
    POST: 'bg-sky-100 text-sky-800',
    PUT: 'bg-amber-100 text-amber-800',
    DELETE: 'bg-rose-100 text-rose-800',
  }[method] || 'bg-gray-100 text-gray-800'
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${color}`}>{method}</span>
}

const CodeBlock = ({ title, code }) => (
  <div className="mt-3">
    <div className="text-xs font-medium text-gray-500 mb-1">{title}</div>
    <pre className="bg-gray-900 text-gray-100 text-xs rounded-lg p-3 overflow-auto shadow-inner">
      <code>{code}</code>
    </pre>
  </div>
)

const APIDocs = () => {
  const baseUrl = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : 'https://mediminds.up.railway.app'

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-light-purple via-medical-light-teal to-medical-light-blue">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-8 mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">MediMinds API Documentation</h1>
          <p className="mt-2 text-gray-700">Endpoints for terminology ingestion, mappings, patient retrieval, and FHIR bundle upload.</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3">Base URL: <span className="font-mono">{baseUrl}</span></div>
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3">Auth: ABHA Id (OAuth)</div>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3">Format: JSON</div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, si) => (
            <motion.div key={si}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className={`bg-gradient-to-br ${section.color} rounded-2xl border p-1`}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
                <div className="space-y-6">
                  {section.items.map((ep, ei) => (
                    <motion.div key={ei}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.4, delay: ei * 0.05 }}
                      className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <Badge method={ep.method} />
                          <span className="font-mono text-sm text-gray-800">{ep.path}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">{ep.desc}</p>
                      <CodeBlock title="cURL" code={ep.curl.replace('$BASE_URL', baseUrl)} />
                      <CodeBlock title="Sample Response" code={ep.response} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mt-10 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Upload NAMASTE CSV via /api/upload before searching or mapping NAMASTE codes.</li>
            <li>Use VITE_API_BASE in frontend to point to your backend base URL.</li>
            <li>FHIR Bundles must include a Patient resource; Conditions are derived and stored for analytics and viewing.</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}

export default APIDocs
