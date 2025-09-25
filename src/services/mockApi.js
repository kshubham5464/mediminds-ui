let storedCsvData = null;
let codeSystem = null;
let conceptMap = null;

const createFhirResources = (csvData) => {
  codeSystem = {
    resourceType: 'CodeSystem',
    id: 'namaste-cs',
    name: 'NamasteCodeSystem',
    status: 'active',
    content: 'complete',
    concept: csvData.map(row => ({
      code: row.source_code,
      display: row.source_display,
    })),
  };

  conceptMap = {
    resourceType: 'ConceptMap',
    id: 'namaste-cm',
    name: 'NamasteConceptMap',
    status: 'active',
    sourceUri: '#namaste-cs',
    targetUri: 'http://hl7.org/fhir/sid/icd-10-cm',
    group: [
      {
        source: codeSystem.id,
        target: 'http://hl7.org/fhir/sid/icd-10-cm',
        element: csvData.map(row => ({
          code: row.source_code,
          display: row.source_display,
          target: [
            {
              code: row.target_code,
              display: row.target_display,
              equivalence: 'equivalent',
            },
          ],
        })),
      },
    ],
  };
};

export const mockApi = {
  saveNamasteCsv: (csvData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        storedCsvData = csvData;
        createFhirResources(csvData);
        console.log('Saved CSV data to mock backend:', storedCsvData);
        console.log('Created CodeSystem:', codeSystem);
        console.log('Created ConceptMap:', conceptMap);
        resolve({ success: true, message: 'CSV data saved successfully.' });
      }, 1000);
    });
  },

  getMappingResources: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (codeSystem && conceptMap) {
          resolve({
            success: true,
            data: {
              codeSystem,
              conceptMap,
            },
          });
        } else {
          resolve({
            success: false,
            message: 'No mapping resources found. Please ingest a CSV file first.',
          });
        }
      }, 500);
    });
  },
};