# Habitera

A web application that generates resident lists and mailbox labels from a Supabase database.

## Features

- Connect to Supabase to fetch and manage resident data
- Select from multiple buildings in the database
- Generate alphabetically sorted resident lists on A4 paper
- Create mailbox labels with apartment numbers and resident names
- Export as PDF for printing
- Preview PDFs in the browser
- Manage residents with CRUD operations
- Demo mode with sample data

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Supabase project with the appropriate tables set up

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
   - Fill in your Supabase URL and anon key in `.env.local`
```bash
cp .env.example .env.local
```

4. Start the development server
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Setting up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Set up the following tables in your Supabase database:

### Buildings Table
```sql
create table buildings (
  id bigint generated by default as identity primary key,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Residents Table
```sql
create table residents (
  id bigint generated by default as identity primary key,
  name text not null,
  apartment_number text not null,
  priority integer default 0,
  building_id bigint references buildings(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

3. Insert some sample buildings:
```sql
insert into buildings (title) values ('Sample Building 1');
insert into buildings (title) values ('Sample Building 2');
```

4. Get your Supabase URL and anon key from the project settings and add them to your `.env.local` file

## Environment Variables

The application uses the following environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

You can set these in a `.env.local` file at the root of the project.

## Using the Application

### Demo Mode

Click the "Prófa með sýnigögnum" (Try with sample data) button to test the application with sample data.

### Connecting to Supabase

If your environment variables are set up correctly, the application will automatically fetch the list of buildings from your Supabase database.

### Selecting a Building

Select the building you want to view data for. Click on a building name to select it, then click "Sækja gögn fyrir valda byggingu" (Fetch data for selected building) to load the residents for that building.

### Managing Residents

1. Go to the "Breyta gögnum" (Manage Data) tab
2. Here you can add, edit, and delete residents for the selected building
3. Changes are saved to the Supabase database in real-time

### Generating PDFs

1. Choose between "Íbúalisti" (Resident List) or "Póstkassamerki" (Mailbox Labels)
2. Preview the PDF in the browser
3. Click "Hlaða niður PDF" to download the PDF

## License

This project is licensed under the MIT License - see the LICENSE file for details.
