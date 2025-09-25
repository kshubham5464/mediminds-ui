import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const DataIngestion = () => {
  const [activeTab, setActiveTab] = useState('csv');
  const [csvFile, setCsvFile] = useState(null);
  const [fhirFile, setFhirFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCsvFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleFhirFileChange = (e) => {
    setFhirFile(e.target.files[0]);
  };

  const handleCsvIngest = () => {
    if (!csvFile) {
      alert('Please select a CSV file to ingest.');
      return;
    }

    setLoading(true);
    // Here you would typically send the file to a backend for processing.
    // For this example, we'll simulate processing on the client side.
    console.log('Simulating ingestion of', csvFile.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      // For now, we'll just log the data.
      // In the next step, we will process this data.
      console.log(csvData);
      alert('File ingested successfully! Check the console for the data.');
      setLoading(false);
    };
    reader.readAsText(csvFile);
  };

  const handleFhirIngest = () => {
    if (!fhirFile) {
      alert('Please select a FHIR JSON file to upload.');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bundle = JSON.parse(event.target.result);
        const response = await fetch('http://localhost:5000/api/upload/fhir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bundle)
        });
        if (response.ok) {
          alert('FHIR Bundle uploaded successfully!');
        } else {
          const error = await response.json();
          alert('Error uploading FHIR Bundle: ' + error.error);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error processing file');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(fhirFile);
  };

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
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Ingestion</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('csv')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'csv'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          CSV Upload
        </button>
        <button
          onClick={() => setActiveTab('fhir')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'fhir'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          FHIR Bundles
        </button>
      </div>

      {activeTab === 'csv' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Namaste CSV File
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleCsvFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              onClick={handleCsvIngest}
              disabled={loading || !csvFile}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Ingesting...' : 'Ingest Data'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'fhir' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <label htmlFor="fhir-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload FHIR Bundle JSON File
              </label>
              <input
                id="fhir-upload"
                type="file"
                accept=".json"
                onChange={handleFhirFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              onClick={handleFhirIngest}
              disabled={loading || !fhirFile}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Uploading...' : 'Upload Bundle'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataIngestion;
