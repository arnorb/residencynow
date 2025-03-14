import { GoogleSpreadsheet } from 'google-spreadsheet';

export interface Resident {
  name: string;
  apartmentNumber: string;
}

export interface Building {
  title: string;
  index: number;
  lastUpdated?: Date;
}

/**
 * Fetches the list of available sheets (buildings) from a Google Spreadsheet
 * 
 * @param sheetId - The ID of the Google Spreadsheet
 * @param apiKey - The Google API key
 * @returns A promise that resolves to an array of Building objects
 */
export async function fetchBuildings(
  sheetId: string,
  apiKey: string
): Promise<Building[]> {
  try {
    // Initialize the sheet with API key
    const doc = new GoogleSpreadsheet(sheetId, { apiKey });
    
    // Load document properties and sheets
    await doc.loadInfo();
    
    // Map sheets to Building objects
    const buildings = doc.sheetsByIndex.map((sheet, index) => ({
      title: sheet.title,
      index,
      // Unfortunately, the Google Sheets API doesn't provide last updated information
      // for individual sheets through the javascript client library
    }));
    
    return buildings;
  } catch (error) {
    console.error('Error fetching buildings:', error);
    throw error;
  }
}

/**
 * Fetches resident data from a Google Spreadsheet using an API key
 * 
 * @param sheetId - The ID of the Google Spreadsheet
 * @param apiKey - The Google API key
 * @param sheetIndex - The index of the sheet to fetch data from (0-based)
 * @returns A promise that resolves to an array of Resident objects
 */
export async function fetchResidents(
  sheetId: string,
  apiKey: string,
  sheetIndex = 0
): Promise<Resident[]> {
  try {
    // Initialize the sheet with API key
    const doc = new GoogleSpreadsheet(sheetId, { apiKey });
    
    // Load document properties and sheets
    await doc.loadInfo();
    
    // Get the specified sheet by index
    const sheet = doc.sheetsByIndex[sheetIndex];
    
    // Load all rows
    const rows = await sheet.getRows();
    
    // Map rows to Resident objects
    // Assuming the sheet has columns 'name' and 'apartmentNumber'
    const residents = rows.map((row) => ({
      name: row.get('name') || '',
      apartmentNumber: row.get('apartmentNumber') || ''
    }));
    
    return residents;
  } catch (error) {
    console.error('Error fetching residents:', error);
    throw error;
  }
}

// Sort residents alphabetically by name
export function sortResidentsByName(residents: Resident[]): Resident[] {
  return [...residents].sort((a, b) => a.name.localeCompare(b.name, 'is'));
}

// Group residents by apartment number
export function groupResidentsByApartment(residents: Resident[]): Record<string, Resident[]> {
  return residents.reduce((groups, resident) => {
    const key = resident.apartmentNumber;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(resident);
    return groups;
  }, {} as Record<string, Resident[]>);
} 