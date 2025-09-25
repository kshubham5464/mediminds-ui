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

    for (const namaste of namasteData) {
      if (!namaste.Disease) continue;

      let bestMatch = null;
      let bestScore = 0;

      for (const icd of icdData) {
        if (!icd.Disease) continue;

        const score = fuzzball.ratio(namaste.Disease.toLowerCase(), icd.Disease.toLowerCase());
        if (score > bestScore && score > 70) { // Threshold for match
          bestMatch = {
            disease: icd.Disease,
            code: icd.ICD_TM2_codes,
            display: icd['Name English']
          };
          bestScore = score;
        }
      }

      if (bestMatch) {
        mappings.push({
          namaste: namaste,
          icd: bestMatch,
          similarity: bestScore
        });
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
    fs.writeFileSync('diseaseMappings.json', JSON.stringify(mappings, null, 2));
    console.log('\nMappings saved to diseaseMappings.json');

  } catch (error) {
    console.error('Error in main:', error);
  }
}

// Run main
main();

export { createMapping, searchDisease };
