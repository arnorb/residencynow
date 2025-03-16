import { fetchResidents, fetchBuildings } from '../services/googleSheets';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function testGoogleSheetsConnection() {
  console.log('Testing Google Sheets connection...');
  
  const apiKey = process.env.VITE_GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.VITE_GOOGLE_SHEETS_ID;
  
  if (!apiKey || !sheetId) {
    console.error('Error: Missing environment variables.');
    console.error('Make sure you have set VITE_GOOGLE_SHEETS_API_KEY and VITE_GOOGLE_SHEETS_ID in .env.local');
    process.exit(1);
  }
  
  try {
    // First, fetch the list of buildings (sheets)
    console.log(`Fetching buildings from sheet ID: ${sheetId}...`);
    const buildings = await fetchBuildings(sheetId, apiKey);
    
    console.log(`Found ${buildings.length} buildings (sheets):`);
    buildings.forEach((building, index) => {
      console.log(`${index + 1}. ${building.title} (index: ${building.index})`);
    });
    
    if (buildings.length === 0) {
      console.log('No sheets found in the Google Spreadsheet (or only the instructions sheet was found).');
      process.exit(1);
    }
    
    // Now, fetch residents for each building
    console.log('\nFetching residents for each building:');
    
    for (const building of buildings) {
      console.log(`\n--- Building: ${building.title} ---`);
      const residents = await fetchResidents(sheetId, apiKey, building.index);
      
      console.log(`Successfully fetched ${residents.length} residents:`);
      
      if (residents.length === 0) {
        console.log('No residents found. Make sure your Google Sheet has data.');
        console.log('The sheet should have columns named "name" and "apartmentNumber".');
      } else {
        // Check if the data looks valid
        const emptyNames = residents.filter(r => !r.name).length;
        const emptyApartments = residents.filter(r => !r.apartmentNumber).length;
        
        if (emptyNames > 0 || emptyApartments > 0) {
          console.log('\nWARNING: Some data appears to be missing:');
          console.log(`- ${emptyNames} residents have empty names`);
          console.log(`- ${emptyApartments} residents have empty apartment numbers`);
          console.log('\nMake sure your Google Sheet has columns named exactly "name" and "apartmentNumber".');
        }
        
        // Show the first 5 residents
        console.table(residents.slice(0, 5));
        
        if (residents.length > 5) {
          console.log(`... and ${residents.length - 5} more.`);
        }
      }
    }
    
    console.log('\nTest completed successfully!');
    console.log('If the data doesn\'t look right, check that:');
    console.log('1. Your Google Sheet has columns named exactly "name" and "apartmentNumber"');
    console.log('2. The sheet is publicly accessible (or shared with your service account)');
    console.log('3. Each sheet represents a building with resident data');
  } catch (error) {
    console.error('Error fetching data from Google Sheets:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testGoogleSheetsConnection(); 