import request from 'supertest';
import express from 'express';
import app from '../app.js'; // Adjust path if needed

describe('API Tests', () => {
  beforeAll(() => {
    process.env.MOCK_MODE = 'true'; // Enable mock mode for tests
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/patient/:abhaId', () => {
    it('should return patient data for valid ABHA ID', async () => {
      const validAbhaId = '12-3456-7890-1234';
      const response = await request(app).get(`/api/patient/${validAbhaId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('abhaId', validAbhaId);
      expect(response.body).toHaveProperty('firstName');
      expect(response.body).toHaveProperty('lastName');
    });

    it('should return 400 for invalid ABHA ID format', async () => {
      const invalidAbhaId = 'invalid-id';
      const response = await request(app).get(`/api/patient/${invalidAbhaId}`);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid ABHA ID format');
    });

    it('should return 404 for non-existent ABHA ID', async () => {
      const nonExistentAbhaId = '99-9999-9999-9999';
      const response = await request(app).get(`/api/patient/${nonExistentAbhaId}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Patient not found');
    });

    it('should return 503 when MOCK_MODE is false', async () => {
      process.env.MOCK_MODE = 'false';
      const validAbhaId = '12-3456-7890-1234';
      const response = await request(app).get(`/api/patient/${validAbhaId}`);
      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('error', 'Service unavailable');
      process.env.MOCK_MODE = 'true'; // Reset for other tests
    });

    // Note: Rate limiting test would require mocking time or multiple requests
  });
});
