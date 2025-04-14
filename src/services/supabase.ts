import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Supabase connection details from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Check if environment variables are configured
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are not configured.');
}

// Create a single supabase client for interacting with your database
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Authentication Functions
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

// Types
export interface Resident {
  id?: number;
  name: string;
  apartmentNumber: string; // Using camelCase to match existing code
  priority?: number;
  building_id: number;
  exclude_a4?: boolean;
}

export interface Building {
  id: number;
  title: string;
}

// Extend Building interface with audit information
export interface BuildingWithAudit extends Building {
  lastEdit?: {
    timestamp: string;
    operation: string;
    user_id?: string;
  }
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
  exclude_a4?: boolean;
}

const mapFromDbResident = (dbResident: DbResident): Resident => ({
  id: dbResident.id,
  name: dbResident.name,
  apartmentNumber: dbResident.apartment_number,
  priority: dbResident.priority,
  building_id: dbResident.building_id,
  exclude_a4: dbResident.exclude_a4,
});

// Fetch all buildings
export async function fetchBuildings(): Promise<Building[]> {
  try {
    // First check if we have an authenticated session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No authenticated session found when fetching buildings');
    }
    
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .order('id');
    
    if (error) {
      if (error.code === 'PGRST301' || error.message.includes('JWT')) {
        throw new Error('Authentication error when fetching buildings - session may be invalid');
      }
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching buildings:', error);
    throw error;
  }
}

// Fetch all buildings with audit information
export async function fetchBuildingsWithAudit(): Promise<BuildingWithAudit[]> {
  try {
    // First check if we have an authenticated session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No authenticated session found when fetching buildings');
    }
    
    // Step 1: Get all buildings
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('*')
      .order('title');
    
    if (buildingsError) {
      throw buildingsError;
    }
    
    if (!buildings?.length) return [];
    
    // Step 2: For each building, get the most recent audit log entry
    const buildingsWithEdits: BuildingWithAudit[] = await Promise.all(
      buildings.map(async (building) => {
        // Query for building edits
        const { data: buildingEdits } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('table_name', 'buildings')
          .eq('record_id', building.id)
          .order('timestamp', { ascending: false })
          .limit(1);
          
        // Query for resident edits associated with this building
        const { data: residentEdits } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('table_name', 'residents')
          // Look for residents that belong to this building in either previous or new data
          .or(`previous_data->>building_id.eq.${building.id},changed_data->>building_id.eq.${building.id}`)
          .order('timestamp', { ascending: false })
          .limit(1);
        
        // Find the most recent edit between the two
        const buildingEdit = buildingEdits?.[0];
        const residentEdit = residentEdits?.[0];
        
        let lastEdit = null;
        
        if (buildingEdit && residentEdit) {
          // Compare timestamps to get the most recent
          lastEdit = new Date(buildingEdit.timestamp) > new Date(residentEdit.timestamp)
            ? buildingEdit : residentEdit;
        } else {
          lastEdit = buildingEdit || residentEdit || null;
        }
        
        // Return building with last edit information
        return {
          ...building,
          lastEdit: lastEdit 
            ? {
                timestamp: lastEdit.timestamp,
                operation: lastEdit.operation,
                user_id: lastEdit.user_id
              }
            : undefined
        };
      })
    );
    
    return buildingsWithEdits;
  } catch (error) {
    console.error('Error fetching buildings with audit info:', error);
    throw error;
  }
}

// Fetch residents for a specific building
export async function fetchResidents(buildingId: number): Promise<Resident[]> {
  try {
    // First check if we have an authenticated session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No authenticated session found when fetching residents');
    }
    
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .eq('building_id', buildingId)
      .order('name');
    
    if (error) {
      if (error.code === 'PGRST301' || error.message.includes('JWT')) {
        throw new Error('Authentication error when fetching residents - session may be invalid');
      }
      throw error;
    }
    
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
    if (updates.exclude_a4 !== undefined) dbUpdates.exclude_a4 = updates.exclude_a4;
    
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

// Helper functions have been moved to src/utils/residentUtils.ts

// Create multiple residents at once
export async function createMultipleResidents(residents: Omit<Resident, 'id'>[]): Promise<Resident[]> {
  if (residents.length === 0) return [];
  
  try {
    const dbResidents = residents.map(mapToDbResident);
    
    const { data, error } = await supabase
      .from('residents')
      .insert(dbResidents)
      .select();
    
    if (error) {
      console.error('Error creating multiple residents:', error);
      throw error;
    }
    
    return (data || []).map(mapFromDbResident);
  } catch (error) {
    console.error('Error creating multiple residents:', error);
    throw error;
  }
} 