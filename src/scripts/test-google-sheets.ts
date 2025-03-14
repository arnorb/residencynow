import { fetchResidents } from '../services/googleSheets';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function testGoogleSheetsConnection() {
  console.log('Testing Google Sheets connection...');
  
  const apiKey = process.env.VITE_GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.VITE_GOOGLE_SHEETS_ID;
  const sheetIndex = Number(process.env.VITE_GOOGLE_SHEETS_INDEX || 0);
  
  if (!apiKey || !sheetId) {
    console.error('Error: Missing environment variables.');
    console.error('Make sure you have set VITE_GOOGLE_SHEETS_API_KEY and VITE_GOOGLE_SHEETS_ID in .env.local');
    process.exit(1);
  }
  
  try {
    console.log(`Fetching data from sheet ID: ${sheetId} (index: ${sheetIndex})...`);
    const residents = await fetchResidents(sheetId, apiKey, sheetIndex);
    
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
    
    console.log('\nTest completed successfully!');
    console.log('If the data doesn\'t look right, check that:');
    console.log('1. Your Google Sheet has columns named exactly "name" and "apartmentNumber"');
    console.log('2. The sheet is publicly accessible (or shared with your service account)');
    console.log('3. You\'re using the correct sheet index (0 for the first sheet)');
  } catch (error) {
    console.error('Error fetching data from Google Sheets:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testGoogleSheetsConnection(); 