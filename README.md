# ResidencyNow

A web application that generates resident lists and mailbox labels from Google Sheets data.

## Features

- Connect to Google Sheets to fetch resident data
- Select from multiple buildings (sheets) in a single Google Spreadsheet
- Generate alphabetically sorted resident lists on A4 paper
- Create mailbox labels with apartment numbers and resident names
- Export as PDF for printing
- Preview PDFs in the browser
- Demo mode with sample data

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Google Cloud project with the Google Sheets API enabled
- A Google API key with access to the Google Sheets API

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/residencynow.git
cd residencynow
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
   - Copy `.env.example` to `.env.local`
   - Fill in your Google Sheets API key and spreadsheet ID in `.env.local`
```bash
cp .env.example .env.local
```

4. Start the development server
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Setting up Google Sheets

1. Create a Google Sheet with multiple sheets, where each sheet represents a building
2. Each sheet should have at least two columns: `name` and `apartmentNumber`
3. The sheet name will be displayed as the building name in the application
4. Fill in the data with resident names and their apartment numbers for each building
5. Make sure your Google Sheet is publicly accessible (read-only is fine)
6. Get the spreadsheet ID from the URL (the long string between `/d/` and `/edit` in the URL)

## Setting up Google API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API for your project
4. Go to "Credentials" and create an API key
5. (Optional) Restrict the API key to only the Google Sheets API
6. Copy the API key to your `.env.local` file

## Environment Variables

The application uses the following environment variables:

- `VITE_GOOGLE_SHEETS_API_KEY`: Your Google API key
- `VITE_GOOGLE_SHEETS_ID`: The ID of your Google Spreadsheet

You can set these in a `.env.local` file at the root of the project.

## Testing

### Unit Tests

Run the unit tests with:

```bash
npm test
```

Or run them in watch mode:

```bash
npm run test:watch
```

### Testing Google Sheets Connection

To test your Google Sheets connection from the command line:

```bash
npm run test:sheets
```

This will attempt to connect to your Google Sheet using the credentials in `.env.local` and display the first few rows of data if successful.

## Using the Application

### Demo Mode

Click the "Prófa með sýnigögnum" (Try with sample data) button to test the application with sample data.

### Connecting to Google Sheets

If your environment variables are set up correctly, you'll see a "Sækja lista yfir byggingar" (Fetch list of buildings) button. Click it to load the available buildings (sheets) from your Google Spreadsheet.

### Selecting a Building

After fetching the list of buildings, you can select the building you want to view data for. Click on a building name to select it, then click "Sækja gögn fyrir valda byggingu" (Fetch data for selected building) to load the residents for that building.

### Generating PDFs

1. Choose between "Íbúalisti" (Resident List) or "Póstkassamerki" (Mailbox Labels)
2. Preview the PDF in the browser
3. Click "Hlaða niður PDF" to download the PDF

## License

This project is licensed under the MIT License - see the LICENSE file for details.
