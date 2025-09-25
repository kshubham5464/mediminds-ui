# Hospital EMR System

A comprehensive Electronic Medical Record (EMR) system built with React.js that integrates ABHA ID authentication, NAMASTE traditional medicine codes, ICD-11 codes, and FHIR standards.

## 🏥 Features

### 1. ABHA ID Authentication
- Secure login using Ayushman Bharat Health Account (ABHA) ID
- 14-digit ABHA ID format validation
- Persistent login sessions

### 2. Patient Registration
- Comprehensive patient information capture
- Personal, contact, and medical information
- ABHA ID integration
- Form validation and error handling

### 3. Code Mapping Tool
- Search and map NAMASTE traditional medicine codes
- Search and map ICD-11 codes
- Dropdown search functionality with real-time filtering
- Support for local NAMASTE API integration
- Support for local ICD API integration
- Three-code system display (NAMASTE, ICD-11 TM, ICD Biomedicine)

### 4. FHIR Bundle Generation
- Generate FHIR-compliant bundles
- Patient and Condition resources
- Multi-coding system support
- JSON export functionality

### 5. CodeSystem & ConceptMap
- FHIR CodeSystem generation for NAMASTE codes
- FHIR CodeSystem generation for ICD-11 codes
- ConceptMap generation for NAMASTE ↔ ICD-11 mappings
- Terminologies are stored locally for demonstration

### 6. Data Analytics
- Patient registration statistics
- Gender and age distribution analytics
- Most common conditions tracking
- Registration trends (last 7 days)
- Export functionality for data analysis

### 7. Record Viewing
- Patient record search and filtering
- FHIR bundle viewing with detailed breakdowns
- Export individual records as JSON
- Comprehensive patient history display

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Modern web browser

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Open your browser and navigate to `http://localhost:5173`
   - Use any 14-digit number as ABHA ID for login (demo purposes)

## 🧪 Testing the Application

### Sample ABHA ID
Use any 14-digit number for testing login (e.g., `12-3456-7890-1234`)

### Test Workflow
1. **Login** with a sample ABHA ID
2. **Register a patient** with sample data
3. **Use the mapping tool** to search for conditions and generate FHIR bundles
4. **View analytics** to see the generated data
5. **Browse records** to review patient information and FHIR resources

## 🔗 API Integration

### Local APIs Setup
The system is designed to integrate with local NAMASTE and ICD APIs. To connect your local APIs:

1. **NAMASTE API**: Update the API endpoint in `src/components/MappingTool.jsx`
2. **ICD API**: Update the API endpoint in `src/components/MappingTool.jsx`

### Mock Data
For demonstration purposes, the system includes mock data for both NAMASTE and ICD codes.

## 📊 Data Storage

The application uses browser localStorage for data persistence:
- `patients`: Patient registration data
- `fhirBundles`: Generated FHIR bundles
- `codeSystems`: Generated FHIR CodeSystems
- `conceptMaps`: Generated FHIR ConceptMaps
- `emr_user`: Authentication session data

## 🎨 UI/UX Features

- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile
- **Professional Medical Theme**: Clean, healthcare-focused design
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Loading States**: Smooth loading animations and feedback
- **Error Handling**: User-friendly error messages and validation
- **Print Support**: Optimized printing for medical records

## 🔒 Security Features

- **Client-side Authentication**: ABHA ID validation and session management
- **Data Validation**: Comprehensive form validation and sanitization
- **Session Management**: Automatic logout and session expiry

## 🤝 Technical Stack

- **Frontend**: React.js with Vite
- **Styling**: Tailwind CSS with custom medical theme
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Heroicons and Lucide React
- **Standards**: FHIR R4 compliance
- **Storage**: Browser localStorage

Built with ❤️ for improving healthcare delivery through technology.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
