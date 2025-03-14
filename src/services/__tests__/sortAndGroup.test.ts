import { describe, it, expect } from 'vitest';
import { sortResidentsByName, groupResidentsByApartment } from '../googleSheets';

// Mock data
const mockResidents = [
  { name: 'Jón Jónsson', apartmentNumber: '101' },
  { name: 'Anna Guðmundsdóttir', apartmentNumber: '101' },
  { name: 'Guðrún Sigurðardóttir', apartmentNumber: '102' },
];

describe('Resident Sorting and Grouping', () => {
  describe('sortResidentsByName', () => {
    it('should sort residents alphabetically by name', () => {
      const sorted = sortResidentsByName(mockResidents);
      
      expect(sorted[0].name).toBe('Anna Guðmundsdóttir');
      expect(sorted[1].name).toBe('Guðrún Sigurðardóttir');
      expect(sorted[2].name).toBe('Jón Jónsson');
    });
    
    it('should not modify the original array', () => {
      const original = [...mockResidents];
      sortResidentsByName(mockResidents);
      
      expect(mockResidents).toEqual(original);
    });
  });
  
  describe('groupResidentsByApartment', () => {
    it('should group residents by apartment number', () => {
      const grouped = groupResidentsByApartment(mockResidents);
      
      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped['101']).toHaveLength(2);
      expect(grouped['102']).toHaveLength(1);
      expect(grouped['101'][0].name).toBe('Jón Jónsson');
      expect(grouped['101'][1].name).toBe('Anna Guðmundsdóttir');
    });
  });
}); 