import { describe, it, expect } from 'vitest';
import { fetchResidents } from '../googleSheets';

// This test requires actual environment variables to be set
// It will be skipped if the environment variables are not set
describe.skipIf(!import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || !import.meta.env.VITE_GOOGLE_SHEETS_ID)(
  'Google Sheets Integration Test', () => {
    it('should fetch real data from Google Sheets', async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY as string;
      const sheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID as string;
      const sheetIndex = Number(import.meta.env.VITE_GOOGLE_SHEETS_INDEX || 0);
      
      const residents = await fetchResidents(sheetId, apiKey, sheetIndex);
      
      // Verify that we got some data back
      expect(residents).toBeDefined();
      expect(Array.isArray(residents)).toBe(true);
      
      // If there are any residents, verify they have the expected properties
      if (residents.length > 0) {
        const firstResident = residents[0];
        expect(firstResident).toHaveProperty('name');
        expect(firstResident).toHaveProperty('apartmentNumber');
        expect(typeof firstResident.name).toBe('string');
        expect(typeof firstResident.apartmentNumber).toBe('string');
      }
    }, 10000); // Increase timeout for API call
  }
); 