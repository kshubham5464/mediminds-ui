import fs from 'fs';
import csv from 'csv-parser';
import * as fuzzball from 'fuzzball';

const NAMASTE_CSV = 'uploads/current.csv';
const ICD_CSV = 'icd.csv';

// Read CSV and return array of objects
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Fuzzy match diseases and create mapping
async function createMapping() {
  try {
    const namasteData = await readCSV(NAMASTE_CSV);
    const icdData = await readCSV(ICD_CSV);

    const mappings = [];

    // Group ICD data by disease
    const icdByDisease = {};
    for (const icd of icdData) {
      if (!icd.Disease) continue;
      if (!icdByDisease[icd.Disease]) {
        icdByDisease[icd.Disease] = [];
      }
      icdByDisease[icd.Disease].push(icd);
    }

    // Group namaste data by disease
    const namasteByDisease = {};
    for (const namaste of namasteData) {
      if (!namaste.Disease) continue;
      if (!namasteByDisease[namaste.Disease]) {
        namasteByDisease[namaste.Disease] = [];
      }
      namasteByDisease[namaste.Disease].push(namaste);
    }

    for (const disease in namasteByDisease) {
      const namasteEntries = namasteByDisease[disease];
      const icdEntries = icdByDisease[disease];

      if (icdEntries) {
        // Assign ICD entries sequentially to namaste entries
        for (let i = 0; i < namasteEntries.length; i++) {
          const namaste = namasteEntries[i];
          const icd = icdEntries[i % icdEntries.length]; // Cycle through ICD entries if more namaste

          mappings.push({
            namaste: namaste,
            icd: {
              disease: icd.Disease,
              code: icd.ICD_TM2_codes,
              display: icd['Name English']
            },
            similarity: 100 // Since exact disease match
          });
        }
      }
    }

    return mappings;
  } catch (error) {
    console.error('Error creating mapping:', error);
    throw error;
  }
}

// Search function
function searchDisease(mappings, query) {
  const lowerQuery = query.toLowerCase();

  for (const mapping of mappings) {
    if (mapping.namaste.Disease && mapping.namaste.Disease.toLowerCase().includes(lowerQuery)) {
      return {
        type: 'NAMASTE',
        query: query,
        namaste: mapping.namaste,
        icd: mapping.icd,
        similarity: mapping.similarity
      };
    }
    if (mapping.icd.disease && mapping.icd.disease.toLowerCase().includes(lowerQuery)) {
      return {
        type: 'ICD',
        query: query,
        namaste: mapping.namaste,
        icd: mapping.icd,
        similarity: mapping.similarity
      };
    }
  }

  return null;
}

// Main execution
async function main() {
  try {
    console.log('Creating disease mappings...');
    const mappings = await createMapping();
    console.log(`Created ${mappings.length} mappings`);

    // Example searches
    const examples = ['tuberculosis', 'diabetes', 'malaria'];

    for (const example of examples) {
      const result = searchDisease(mappings, example);
      if (result) {
        console.log(`\nSearch for "${result.query}" (${result.type}):`);
        console.log('NAMASTE:', result.namaste.Disease);
        console.log('ICD:', result.icd.disease);
        console.log('Similarity:', result.similarity);
      } else {
        console.log(`\nNo match found for "${example}"`);
      }
    }

    // Export mappings to JSON
    fs.writeFileSync('backend/diseaseMappings.json', JSON.stringify(mappings, null, 2));
    console.log('\nMappings saved to backend/diseaseMappings.json');

  } catch (error) {
    console.error('Error in main:', error);
  }
}

// Run main
main();

export { createMapping, searchDisease };
