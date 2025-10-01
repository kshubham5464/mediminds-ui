export const fetchPatientByAbhaId = async (abhaId) => {
  try {
    const response = await fetch(`https://mediminds.up.railway.app/api/patient/${abhaId}`, {
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

export const fetchAllPatients = async () => {
  try {
    const response = await fetch(`https://mediminds.up.railway.app/api/patients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const patientsData = await response.json();
    return { success: true, data: patientsData };
  } catch (error) {
    console.error("Error fetching all patients:", error);
    return { success: false, error: error.message };
  }
};

export const fetchAllBundles = async () => {
  try {
    const response = await fetch(`https://mediminds.up.railway.app/api/fhir-bundles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const bundlesData = await response.json();
    return { success: true, data: bundlesData };
  } catch (error) {
    console.error("Error fetching all bundles:", error);
    return { success: false, error: error.message };
  }
};

export const deleteBundle = async (id) => {
  try {
    const response = await fetch(`https://mediminds.up.railway.app/api/fhir-bundles/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting bundle:", error);
    return { success: false, error: error.message };
  }
};

export const resetBundles = async () => {
  try {
    const response = await fetch(`https://mediminds.up.railway.app/api/reset/fhir-bundles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error resetting bundles:", error);
    return { success: false, error: error.message };
  }
};
