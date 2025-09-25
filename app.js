import express from "express";
import cors from "cors";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import Ajv from "ajv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const patientSchema = JSON.parse(fs.readFileSync(path.join(__dirname, "schemas", "patientSchema.json"), "utf8"));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Disable ETags to prevent 304 Not Modified responses
app.set('etag', false);

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Multer setup (upload dir = uploads/)
const upload = multer({ dest: "uploads/" });

// Path for persisted data
const DATA_FILE = "namasteData.json";

// Load data from file if exists
let namasteData = [];
if (fs.existsSync(DATA_FILE)) {
  try {
    namasteData = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (err) {
    console.error("Error loading data from file:", err);
    namasteData = [];
  }
}

// Load ICD data from CSV
let icdData = [];
const loadICD = () => {
  const results = [];
  fs.createReadStream('icd.csv')
    .pipe(csv())
    .on('data', (row) => {
      results.push({
        disease: row.Disease,
        code: row.ICD11_Biomed_codes,
        term: row['Name English'],
        shortDefinition: row.Short_definition,
        system: 'ICD'
      });
    })
    .on('end', () => {
      icdData = results;
      console.log(`✅ ICD data loaded: ${icdData.length} rows`);
    })
    .on('error', (err) => {
      console.error('❌ Error loading ICD CSV:', err);
    });
};
loadICD();

// Load disease mappings
let diseaseMappings = [];
if (fs.existsSync("diseaseMappings.json")) {
  try {
    diseaseMappings = JSON.parse(fs.readFileSync("diseaseMappings.json", "utf8"));
  } catch (err) {
    console.error("Error loading disease mappings:", err);
    diseaseMappings = [];
  }
}

// Path for patients data
const PATIENTS_FILE = "patients.json";

// Load patients data
let patientsData = [];
if (fs.existsSync(PATIENTS_FILE)) {
  try {
    patientsData = JSON.parse(fs.readFileSync(PATIENTS_FILE, "utf8"));
  } catch (err) {
    console.error("Error loading patients data:", err);
    patientsData = [];
  }
}

// Path for fhir bundles
const FHIR_BUNDLES_FILE = "fhirBundles.json";
let fhirBundlesData = [];
if (fs.existsSync(FHIR_BUNDLES_FILE)) {
  try {
    fhirBundlesData = JSON.parse(fs.readFileSync(FHIR_BUNDLES_FILE, "utf8"));
  } catch (err) {
    console.error("Error loading fhir bundles:", err);
    fhirBundlesData = [];
  }
}

/*
 * Upload & ingest CSV
 */
app.post("/api/upload", upload.single("file"), (req, res) => {
  // Clear old data
  namasteData = [];
  if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE);
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      results.push({
        disease: row.Disease,
        code: row.NAMC_CODE,
        term: row.NAMC_term,
        diacritical: row.NAMC_term_diacritical,
        devanagari: row.NAMC_term_DEVANAGARI,
        nameEnglish: row["Name English"],
        shortDefinition: row.Short_definition,
      });
    })
    .on("end", () => {
      namasteData = results;
      // Save parsed data to JSON file
      fs.writeFileSync(DATA_FILE, JSON.stringify(namasteData, null, 2));
      // Save CSV file permanently, overwriting previous
      const permanentPath = `uploads/current.csv`;
      if (fs.existsSync(permanentPath)) {
        fs.unlinkSync(permanentPath);
      }
      fs.renameSync(req.file.path, permanentPath);
      console.log(`✅ CSV saved to ${permanentPath} and ingested: ${namasteData.length} rows`);
      res.json({
        message: "CSV ingested successfully",
        count: namasteData.length,
      });
    })
    .on("error", (err) => {
      console.error("❌ Error reading CSV:", err);
      res.status(500).json({ message: "Error reading CSV file" });
    });
});

/*
 * Fetch ingested data
 */
app.get("/api/namaste", (req, res) => {
  res.json(namasteData);
});

/*
 * Fetch ICD data
 */
app.get("/api/icd", (req, res) => {
  res.json(icdData);
});

/*
 * Reset all data
 */
app.post("/api/reset", (req, res) => {
  namasteData = [];
  if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE);
  }
  res.json({ message: "All data has been reset successfully" });
});

/*
 * Fetch disease mappings
 */
app.get("/api/disease-mappings", (req, res) => {
  try {
    const mappings = JSON.parse(fs.readFileSync("diseaseMappings.json", "utf8"));
    res.json(mappings);
  } catch (err) {
    console.error("Error loading disease mappings:", err);
    res.json([]);
  }
});

// Initialize AJV for schema validation
const ajv = new Ajv();
const validatePatient = ajv.compile(patientSchema);

// Rate limit stub (simple in-memory counter)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // requests per window

const checkRateLimit = (ip) => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  const requests = rateLimitMap.get(ip).filter(time => time > windowStart);
  if (requests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  requests.push(now);
  rateLimitMap.set(ip, requests);
  return true;
};

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Realistic patient data generator
const generateRealisticPatient = (abhaId) => {
  const index = parseInt(abhaId.replace(/-/g, '').slice(-1)) % 4;
  const patients = [
    {
      firstName: "Amit",
      lastName: "Sharma",
      dateOfBirth: "1985-03-15",
      gender: "male",
      phoneNumber: "+919876543210",
      email: "amit.sharma@example.com",
      address: "45 MG Road, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      emergencyContactName: "Priya Sharma",
      emergencyContactPhone: "+919876543211",
      emergencyContactRelation: "Wife",
      bloodGroup: "A+",
      allergies: "Dust mites",
      currentMedications: "Amlodipine 5mg daily",
      medicalHistory: "Hypertension diagnosed in 2018, managed with medication",
      insuranceProvider: "Star Health Insurance",
      insurancePolicyNumber: "SHI123456789",
      height: 175,
      weight: 70,
      maritalStatus: "married",
      occupation: "Software Engineer",
      registrationDate: "2023-01-15"
    },
    {
      firstName: "Priya",
      lastName: "Patel",
      dateOfBirth: "1992-07-22",
      gender: "female",
      phoneNumber: "+919876543212",
      email: "priya.patel@example.com",
      address: "12 Linking Road, Bandra",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      emergencyContactName: "Rajesh Patel",
      emergencyContactPhone: "+919876543213",
      emergencyContactRelation: "Father",
      bloodGroup: "B+",
      allergies: "Pollen",
      currentMedications: "Cetirizine 10mg as needed",
      medicalHistory: "Seasonal allergies, occasional asthma",
      insuranceProvider: "ICICI Lombard",
      insurancePolicyNumber: "IL987654321",
      height: 165,
      weight: 55,
      maritalStatus: "single",
      occupation: "Teacher",
      registrationDate: "2023-02-20"
    },
    {
      firstName: "Rajesh",
      lastName: "Kumar",
      dateOfBirth: "1978-11-08",
      gender: "male",
      phoneNumber: "+919876543214",
      email: "rajesh.kumar@example.com",
      address: "78 Connaught Place",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
      emergencyContactName: "Sunita Kumar",
      emergencyContactPhone: "+919876543215",
      emergencyContactRelation: "Wife",
      bloodGroup: "O+",
      allergies: "None",
      currentMedications: "Metformin 500mg twice daily",
      medicalHistory: "Type 2 diabetes diagnosed in 2015",
      insuranceProvider: "Max Bupa",
      insurancePolicyNumber: "MB456789123",
      height: 170,
      weight: 75,
      maritalStatus: "married",
      occupation: "Businessman",
      registrationDate: "2023-03-10"
    },
    {
      firstName: "Kavita",
      lastName: "Singh",
      dateOfBirth: "1988-05-30",
      gender: "female",
      phoneNumber: "+919876543216",
      email: "kavita.singh@example.com",
      address: "23 Park Street",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700016",
      emergencyContactName: "Amit Singh",
      emergencyContactPhone: "+919876543217",
      emergencyContactRelation: "Husband",
      bloodGroup: "AB+",
      allergies: "Shellfish",
      currentMedications: "Thyroxine 50mcg daily",
      medicalHistory: "Hypothyroidism, shellfish allergy",
      insuranceProvider: "HDFC ERGO",
      insurancePolicyNumber: "HE789123456",
      height: 160,
      weight: 60,
      maritalStatus: "married",
      occupation: "Doctor",
      registrationDate: "2023-04-05"
    }
  ];
  return {
    abhaId,
    ...patients[index]
  };
};

// Validate ABHA ID format
const isValidAbhaId = (abhaId) => {
  const abhaRegex = /^\d{2}-\d{4}-\d{4}-\d{4}$/;
  return abhaRegex.test(abhaId);
};

/*
 * Get patient details by ABHA ID
 */
app.get("/api/patient/:abhaId", (req, res) => {
  const { abhaId } = req.params;
  const clientIp = req.ip || req.connection.remoteAddress;

  // Rate limit check
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  // Validate ABHA ID format
  if (!isValidAbhaId(abhaId)) {
    return res.status(400).json({ error: "Invalid ABHA ID format" });
  }

  // Check MOCK_MODE (default to true for development)
  if (process.env.MOCK_MODE === "false") {
    return res.status(503).json({ error: "Service unavailable" });
  }

  // Simulate some ABHA IDs not found
  const validIds = ["12-3456-7890-1234", "23-4567-8901-2345", "34-5678-9012-3456", "45-6789-0123-4567"];
  if (!validIds.includes(abhaId)) {
    return res.status(404).json({ error: "Patient not found" });
  }

  const patient = generateRealisticPatient(abhaId);

  // Validate against schema
  if (!validatePatient(patient)) {
    console.error("Generated patient data invalid:", validatePatient.errors);
    return res.status(500).json({ error: "Internal server error" });
  }

  // Disable caching for patient data
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  res.json(patient);
});

// Import mapping functions
import { createMapping, searchDisease } from './scripts/mapDiseases.js';

// Cache for mappings
// // let cachedMappings = null;

/*
 * Get disease mappings
 */
app.get("/api/mappings", async (req, res) => {
  try {
    if (!cachedMappings) {
      cachedMappings = await createMapping();
    }
    res.json(cachedMappings);
  } catch (error) {
    console.error("Error getting mappings:", error);
    res.status(500).json({ error: "Failed to get mappings" });
  }
});

/*
 * Search disease mappings
 */
app.get("/api/search-disease/:query", async (req, res) => {
  try {
    const { query } = req.params;
    if (!cachedMappings) {
      cachedMappings = await createMapping();
    }
    const result = searchDisease(cachedMappings, query);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: "No mapping found for the query" });
    }
  } catch (error) {
    console.error("Error searching disease:", error);
    res.status(500).json({ error: "Failed to search disease" });
  }
});

/*
 * Upload FHIR Bundle
 */
app.post("/api/upload/fhir", (req, res) => {
  const bundle = req.body;

  // Basic validation
  if (!bundle || bundle.resourceType !== 'Bundle') {
    console.log('Invalid FHIR Bundle: missing or wrong resourceType');
    return res.status(400).json({ error: "Invalid FHIR Bundle" });
  }

  // Extract Patient
  const patientEntry = bundle.entry?.find(e => e.resource?.resourceType === 'Patient');
  if (!patientEntry) {
    console.log('No Patient resource found');
    return res.status(400).json({ error: "No Patient resource found" });
  }
  const patient = patientEntry.resource;
  const patientData = {
    abhaId: patient.id,
    firstName: patient.name?.[0]?.given?.[0] || 'Unknown',
    lastName: patient.name?.[0]?.family || '',
    gender: patient.gender || 'unknown',
    birthDate: patient.birthDate || null
  };

  // Extract Encounters
  const encounters = bundle.entry?.filter(e => e.resource?.resourceType === 'Encounter').map(e => e.resource) || [];

  // Extract Conditions and map codes
  const conditions = bundle.entry?.filter(e => e.resource?.resourceType === 'Condition').map(e => {
    const cond = e.resource;
    const codings = cond.code?.coding || [];
    let namasteCode = null;
    let icdCode = null;
    for (const coding of codings) {
      if (coding.system === 'http://namaste.terminology.system') {
        namasteCode = coding.code;
      } else if (coding.system && (coding.system.includes('icd') || coding.system.includes('ICD'))) {
        icdCode = coding.code;
      }
    }
    // Map if needed
    if (namasteCode && !icdCode) {
      const mapping = diseaseMappings.find(m => m.namaste.NAMC_CODE === namasteCode);
      if (mapping) {
        icdCode = mapping.biomedicine.code;
      }
    } else if (icdCode && !namasteCode) {
      const mapping = diseaseMappings.find(m => m.biomedicine.code === icdCode);
      if (mapping) {
        namasteCode = mapping.namaste.NAMC_CODE;
      }
    }
    return {
      id: cond.id,
      code: {
        namaste: namasteCode,
        icd: icdCode
      },
      display: cond.code?.text || ''
    };
  }) || [];

  // Store bundle
  const bundleId = bundle.id || `bundle-${Date.now()}`;
  bundle.id = bundleId;
  fhirBundlesData.push(bundle);
  fs.writeFileSync(FHIR_BUNDLES_FILE, JSON.stringify(fhirBundlesData, null, 2));

  // Store patient
  let existingPatient = patientsData.find(p => p.abhaId === patientData.abhaId);
  if (existingPatient) {
    existingPatient.encounters = existingPatient.encounters || [];
    existingPatient.encounters.push(...encounters);
    existingPatient.conditions = existingPatient.conditions || [];
    existingPatient.conditions.push(...conditions);
    existingPatient.bundleIds = existingPatient.bundleIds || [];
    existingPatient.bundleIds.push(bundleId);
  } else {
    patientsData.push({
      ...patientData,
      encounters,
      conditions,
      bundleIds: [bundleId]
    });
  }
  fs.writeFileSync(PATIENTS_FILE, JSON.stringify(patientsData, null, 2));

  res.json({ message: "FHIR Bundle uploaded successfully", patientId: patientData.id });
});

/*
 * Get all patients
 */
app.get("/api/patients", (req, res) => {
  res.json(patientsData);
});

/*
 * Get all FHIR bundles
 */
app.get("/api/fhir-bundles", (req, res) => {
  res.json(fhirBundlesData);
});



// 🚀 Start the server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
