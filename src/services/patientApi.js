const API_BASE_URL = "http://65.2.124.178:5000/api";
export const fetchPatientByAbhaId = async (abhaId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patient/${abhaId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const patientData = await response.json();
    return { success: true, data: patientData };
  } catch (error) {
    console.error("Error fetching patient data:", error);
    return { success: false, error: error.message };
  }
};
export const isValidAbhaIdFormat = (abhaId) => {
  const abhaRegex = /^\d{2}-\d{4}-\d{4}-\d{4}$/;
  return abhaRegex.test(abhaId);
};
export const formatAbhaId = (value) => {
  const cleanValue = value.replace(/\D/g, "");
  return cleanValue.replace(/(\d{2})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3-$4");
};
