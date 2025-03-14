import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { fetchResidents } from '../googleSheets';

// Define types for our mocks
interface MockSheet {
  getRows: () => Promise<MockRow[]>;
}

interface MockRow {
  get: (key: string) => string;
}

// Mock the entire google-spreadsheet module
vi.mock('google-spreadsheet', () => {
  const mockRows = [
    { name: 'Jón Jónsson', apartmentNumber: '101' },
    { name: 'Anna Guðmundsdóttir', apartmentNumber: '101' },
    { name: 'Guðrún Sigurðardóttir', apartmentNumber: '102' },
  ];

  return {
    GoogleSpreadsheet: class MockGoogleSpreadsheet {
      sheetsByIndex: MockSheet[];
      loadInfo: () => Promise<void>;

      constructor() {
        this.sheetsByIndex = [
          {
            getRows: vi.fn().mockResolvedValue(
              mockRows.map(resident => ({
                get: (key: string) => resident[key as keyof typeof resident] || '',
              }))
            ),
          },
        ];
        this.loadInfo = vi.fn().mockResolvedValue(undefined);
      }
    },
  };
});

describe('fetchResidents function', () => {
  beforeAll(() => {
    // Silence console.error during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should fetch residents from Google Sheets', async () => {
    const sheetId = 'test-sheet-id';
    const apiKey = 'test-api-key';
    
    const residents = await fetchResidents(sheetId, apiKey);
    
    expect(residents).toHaveLength(3);
    expect(residents[0].name).toBe('Jón Jónsson');
    expect(residents[0].apartmentNumber).toBe('101');
    expect(residents[1].name).toBe('Anna Guðmundsdóttir');
    expect(residents[2].name).toBe('Guðrún Sigurðardóttir');
  });
}); 