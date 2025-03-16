import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase connection details from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Check if environment variables are configured
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are not configured.');
}

// Create a single supabase client for interacting with your database
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Types
export interface Resident {
  id?: number;
  name: string;
  apartmentNumber: string; // Using camelCase to match existing code
  priority?: number;
  building_id: number;
}

export interface Building {
  id: number;
  title: string;
}

// Database field mapping (converts between camelCase and snake_case)
const mapToDbResident = (resident: Omit<Resident, 'id'>) => ({
  name: resident.name,
  apartment_number: resident.apartmentNumber,
  priority: resident.priority,
  building_id: resident.building_id
});

// Database resident type
interface DbResident {
  id: number;
  name: string;
  apartment_number: string;
  priority?: number;
  building_id: number;
}

const mapFromDbResident = (dbResident: DbResident): Resident => ({
  id: dbResident.id,
  name: dbResident.name,
  apartmentNumber: dbResident.apartment_number,
  priority: dbResident.priority,
  building_id: dbResident.building_id
});

// Fetch all buildings
export async function fetchBuildings(): Promise<Building[]> {
  try {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching buildings:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching buildings:', error);
    throw error;
  }
}

// Fetch residents for a specific building
export async function fetchResidents(buildingId: number): Promise<Resident[]> {
  try {
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .eq('building_id', buildingId)
      .order('name');
    
    if (error) {
      console.error('Error fetching residents:', error);
      throw error;
    }
    
    // Map from database format to application format
    return (data || []).map(mapFromDbResident);
  } catch (error) {
    console.error('Error fetching residents:', error);
    throw error;
  }
}

// CRUD operations for residents

// Create a new resident
export async function createResident(resident: Omit<Resident, 'id'>): Promise<Resident> {
  try {
    const { data, error } = await supabase
      .from('residents')
      .insert(mapToDbResident(resident))
      .select()
      .single();
    
    if (error) {
      console.error('Error creating resident:', error);
      throw error;
    }
    
    return mapFromDbResident(data);
  } catch (error) {
    console.error('Error creating resident:', error);
    throw error;
  }
}

// Update an existing resident
export async function updateResident(id: number, updates: Partial<Omit<Resident, 'id' | 'building_id'>>): Promise<Resident> {
  try {
    // Only map the fields that are being updated
    const dbUpdates: Partial<DbResident> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.apartmentNumber !== undefined) dbUpdates.apartment_number = updates.apartmentNumber;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    
    const { data, error } = await supabase
      .from('residents')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating resident:', error);
      throw error;
    }
    
    return mapFromDbResident(data);
  } catch (error) {
    console.error('Error updating resident:', error);
    throw error;
  }
}

// Delete a resident
export async function deleteResident(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('residents')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting resident:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting resident:', error);
    throw error;
  }
}

// Helper functions (keeping these from the original implementation)

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

// Sort residents by priority (lowest first)
export function sortResidentsByPriority(residents: Resident[]): Resident[] {
  // Create a copy to avoid mutating the original array
  const sortedResidents = [...residents];
  
  // Check if any residents have priority set
  const hasPriority = sortedResidents.some(resident => resident.priority !== undefined);
  
  // If no residents have priority, return the original order
  if (!hasPriority) {
    return sortedResidents;
  }
  
  // Sort by priority (undefined values come last)
  return sortedResidents.sort((a, b) => {
    // If both have priority, compare them
    if (a.priority !== undefined && b.priority !== undefined) {
      return a.priority - b.priority;
    }
    // If only a has priority, a comes first
    if (a.priority !== undefined) {
      return -1;
    }
    // If only b has priority, b comes first
    if (b.priority !== undefined) {
      return 1;
    }
    // If neither has priority, maintain original order
    return 0;
  });
} 