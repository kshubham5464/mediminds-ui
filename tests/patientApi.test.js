/* eslint-disable no-undef */

// Mock fetch globally
global.fetch = jest.fn();

import { fetchPatientByAbhaId, isValidAbhaIdFormat, formatAbhaId } from '../src/services/patientApi';

describe('patientApi', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('fetchPatientByAbhaId', () => {
    it('should return patient data on successful fetch', async () => {
      const mockPatientData = {
        abhaId: '12-3456-7890-1234',
        firstName: 'John',
        lastName: 'Doe'
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPatientData
      });

      const result = await fetchPatientByAbhaId('12-3456-7890-1234');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPatientData);
      expect(fetch).toHaveBeenCalledWith('http://65.2.124.178:5000/api/patient/12-3456-7890-1234', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should return error on fetch failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Patient not found' })
      });

      const result = await fetchPatientByAbhaId('99-9999-9999-9999');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Patient not found');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchPatientByAbhaId('12-3456-7890-1234');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('isValidAbhaIdFormat', () => {
    it('should return true for valid ABHA ID', () => {
      expect(isValidAbhaIdFormat('12-3456-7890-1234')).toBe(true);
    });

    it('should return false for invalid ABHA ID', () => {
      expect(isValidAbhaIdFormat('invalid')).toBe(false);
      expect(isValidAbhaIdFormat('12-345-789-123')).toBe(false);
    });
  });

  describe('formatAbhaId', () => {
    it('should format clean ABHA ID string', () => {
      expect(formatAbhaId('12345678901234')).toBe('12-3456-7890-1234');
    });

    it('should handle input with existing dashes', () => {
      expect(formatAbhaId('12-345678901234')).toBe('12-3456-7890-1234');
    });
  });
});
