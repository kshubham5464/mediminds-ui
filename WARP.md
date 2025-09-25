# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Start Development
```bash
npm run dev
```
Starts the Vite development server on http://localhost:5173

### Build Application
```bash
npm run build
```
Creates production build in `dist/` directory

### Lint Code
```bash
npm run lint
```
Runs ESLint to check code quality and formatting

### Preview Production Build
```bash
npm run preview
```
Preview the production build locally

### Install Dependencies
```bash
npm install
```
Install all project dependencies

### Run Single Test (Manual Testing)
Since this project doesn't have automated tests configured, testing is done manually through the application:
1. Start dev server with `npm run dev`
2. Navigate to http://localhost:5173
3. Test login with any 14-digit ABHA ID (e.g., `12-3456-7890-1234`)
4. Test each module: Patient Registration, Mapping Tool, Data Analytics, Record Viewing

## Architecture Overview

### Technology Stack
- **Frontend**: React 19.1.1 with Vite 7.1.6 build tool
- **Styling**: Tailwind CSS 4.1.13 with custom medical theme
- **Routing**: React Router DOM 7.9.1 for SPA navigation
- **HTTP Client**: Axios 1.12.2 for API communication
- **Icons**: Heroicons and Lucide React for UI icons
- **Standards**: FHIR R4 compliance for healthcare data interchange
- **Storage**: Browser localStorage for demo data persistence

### Application Structure

#### Core Application Flow
1. **Authentication Layer** (`AuthContext.jsx`): ABHA ID-based authentication with localStorage persistence
2. **Protected Routing** (`ProtectedRoute.jsx`): Route protection requiring valid authentication
3. **Dashboard Hub** (`Dashboard.jsx`): Main navigation interface with tabbed module access
4. **Four Main Modules**: Patient Registration, Code Mapping, Analytics, Record Viewing

#### Key Components Architecture

**Authentication & Security**:
- `contexts/AuthContext.jsx`: Centralized authentication state management with ABHA ID validation
- Mock authentication simulates real ABHA ID verification (14-digit validation)
- Session persistence through localStorage with automatic logout capability

**Patient Management**:
- `PatientRegistration.jsx`: Comprehensive patient data capture with validation
- Supports ABHA ID integration, medical history, emergency contacts, insurance info
- Form validation with real-time error feedback and Indian phone number formats

**Medical Coding System**:
- `MappingTool.jsx`: Core FHIR interoperability component
- Three-code system support: NAMASTE traditional medicine, ICD-11 TM, ICD Biomedicine
- Mock API integration ready for local NAMASTE and ICD API connections
- FHIR Bundle, CodeSystem, and ConceptMap generation

**Data Analytics**:
- `DataAnalytics.jsx`: Patient demographics and condition analytics
- Real-time calculations: gender/age distribution, common conditions, registration trends
- Export functionality for data analysis

**Record Management**:
- `RecordViewing.jsx`: Patient record search and FHIR bundle visualization
- Dual view modes: patient-centric and FHIR resource-centric
- Detailed FHIR resource breakdown with multi-coding display

### Data Flow Architecture

#### LocalStorage Schema
- `patients`: Array of patient registration data
- `fhirBundles`: Array of generated FHIR Bundle resources
- `codeSystems`: Generated FHIR CodeSystem resources
- `conceptMaps`: Generated FHIR ConceptMap resources
- `emr_user`: Current authentication session data

#### FHIR Resource Generation
The system generates FHIR R4 compliant resources:
- **Patient Resources**: Include ABHA ID identifiers, demographics, contact info
- **Condition Resources**: Multi-coded with NAMASTE, ICD-11 TM, and ICD Biomedicine systems
- **Bundle Resources**: Collection type bundles containing Patient + Condition entries
- **CodeSystem Resources**: Terminology definitions for NAMASTE and ICD codes
- **ConceptMap Resources**: Cross-terminology mappings between coding systems

#### API Integration Points
Ready for integration with:
- Local NAMASTE API endpoint (configured in `MappingTool.jsx`)
- Local ICD-11 API endpoint (configured in `MappingTool.jsx`)
- Mock data fallback system for development/demo purposes

### Key Medical Standards Integration

**ABHA ID (Ayushman Bharat Health Account)**:
- 14-digit identifier format validation
- Integration as primary patient identifier in FHIR resources
- Authentication mechanism for healthcare provider access

**NAMASTE Traditional Medicine Coding**:
- Traditional medicine terminology system
- Mapped to ICD-11 for interoperability
- Custom CodeSystem generation for FHIR compliance

**FHIR R4 Compliance**:
- Proper resource structuring for Patient, Condition, Bundle, CodeSystem, ConceptMap
- Standard terminologies and value sets
- Healthcare interoperability focus

## Development Guidelines

### Working with Medical Data
- All patient data uses mock/demo format - never commit real healthcare data
- ABHA IDs are validated for format but not against real ABHA registry
- FHIR resources follow R4 specification for healthcare interoperability

### API Integration
- Mock data is used by default in `MappingTool.jsx`
- To connect real APIs, update endpoint URLs in the search functions
- Error handling includes fallback to mock data for development continuity

### State Management
- React Context for authentication state
- Component-level state for UI interactions
- localStorage for demo data persistence (not suitable for production)

### Styling Conventions
- Tailwind CSS utility classes with medical/healthcare color schemes
- Responsive design patterns for desktop, tablet, and mobile
- Professional medical UI theme with blue/green color palette
- Accessibility considerations with proper focus states and semantic markup

### File Structure Patterns
- `components/` - Reusable UI components for each major feature
- `contexts/` - React Context providers for global state
- `pages/` - Top-level page components (Login, Dashboard)
- Configuration files in project root (Vite, Tailwind, ESLint)

### Adding New Medical Codes
1. Update mock data arrays in `MappingTool.jsx`
2. Ensure proper system URLs in FHIR resource generation
3. Add corresponding mappings in the mapping logic
4. Test FHIR Bundle generation with new codes

### FHIR Resource Extensions
When extending FHIR resources:
- Follow FHIR R4 specification
- Use proper system URLs for terminologies
- Ensure CodeSystem and ConceptMap resources are updated
- Test JSON export functionality