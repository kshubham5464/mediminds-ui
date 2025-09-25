// Patient API service for fetching patient details by ABHA ID

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetch patient details by ABHA ID
 * @param {string} abhaId - The ABHA ID in format XX-XXXX-XXXX-XXXX
 * @returns {Promise<Object>} Patient data or error
 */
export const fetchPatientByAbhaId = async (abhaId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patient/${abhaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const patientData = await response.json();
    return { success: true, data: patientData };
  } catch (error) {
    console.error('Error fetching patient data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validate ABHA ID format (client-side)
 * @param {string} abhaId
 * @returns {boolean}
 */
export const isValidAbhaIdFormat = (abhaId) => {
  const abhaRegex = /^\d{2}-\d{4}-\d{4}-\d{4}$/;
  return abhaRegex.test(abhaId);
};

/**
 * Format ABHA ID input
 * @param {string} value
 * @returns {string}
 */
export const formatAbhaId = (value) => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue.replace(/(\d{2})(\d{4})(\d{4})(\d{4})/, '$1-$2-$3-$4');
};
