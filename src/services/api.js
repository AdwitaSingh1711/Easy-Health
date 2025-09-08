// src/services/api.js - Complete version with all doctor appointment methods
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
//
class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Provider endpoints
  async getProviders() {
    return this.request('/appointments/providers');
  }

  async getAvailableSlots(providerId, date) {
    return this.request(`/appointments/available-slots/${providerId}?date=${date}`);
  }

  // Provider Profile endpoints (for doctors)
  async getProviderProfile() {
    return this.request('/appointments/provider-profile');
  }

  async updateProviderProfile(profileData) {
    return this.request('/appointments/provider-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Appointment endpoints
  async bookAppointment(appointmentData) {
    return this.request('/appointments/book', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getMyAppointments() {
    return this.request('/appointments/my-appointments');
  }

  async cancelAppointment(appointmentId) {
    return this.request(`/appointments/${appointmentId}/cancel`, {
      method: 'PUT',
    });
  }

  // NEW: Doctor/Provider appointment endpoints
  async getDoctorAppointments() {
    return this.request('/appointments/doctor-appointments');
  }

  async getDashboardData() {
    return this.request('/appointments/doctor-appointments');
  }

  async completeAppointment(appointmentId) {
    return this.request(`/appointments/${appointmentId}/complete`, {
      method: 'PUT',
    });
  }

  async cancelAppointmentByDoctor(appointmentId) {
    return this.request(`/appointments/${appointmentId}/cancel-by-doctor`, {
      method: 'PUT',
    });
  }

  // Patient documents for doctors to view
  async getPatientDocuments(patientId) {
    return this.request(`/documents/patient/${patientId}`);
  }

  // Document endpoints
  async requestDocumentUpload(fileInfo) {
    return this.request('/documents/upload-request', {
      method: 'POST',
      body: JSON.stringify(fileInfo),
    });
  }

  async confirmDocumentUpload(documentId) {
    return this.request(`/documents/${documentId}/confirm`, {
      method: 'POST',
    });
  }

  async getMyDocuments() {
    return this.request('/documents/my-documents');
  }

  async getDocumentDownloadUrl(documentId) {
    return this.request(`/documents/${documentId}/download`);
  }

  // Upload file directly to Azure using presigned URL
  async uploadFileToAzure(uploadUrl, file) {
    try {
      console.log('Uploading file to Azure:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type,
          'Content-Length': file.size.toString(),
        },
        body: file,
      });

      console.log('Azure upload response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Azure upload error:', errorText);
        throw new Error(`Failed to upload file to Azure: ${response.status} ${response.statusText}`);
      }

      console.log('File uploaded successfully to Azure');
      return response;
    } catch (error) {
      console.error('Azure upload error:', error);
      throw error;
    }
  }
  // Add these methods to your src/services/api.js file
// Place them with your other profile-related methods

// Patient Profile endpoints (for patients)
async getPatientProfile() {
  return this.request('/appointments/patient-profile');
}

async updatePatientProfile(profileData) {
  return this.request('/appointments/patient-profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}
}

export const apiService = new ApiService();