import { Resident } from '../services/supabase';

// Helper function to sort residents by name
export const sortResidentsByName = (residents: Resident[]) => {
  return [...residents].sort((a, b) => a.name.localeCompare(b.name, 'is'));
};

// Group residents by apartment number
export const groupResidentsByApartment = (residents: Resident[]): Record<string, Resident[]> => {
  return residents.reduce((groups, resident) => {
    const key = resident.apartmentNumber;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(resident);
    return groups;
  }, {} as Record<string, Resident[]>);
};

// Sort residents by priority
export const sortResidentsByPriority = (residents: Resident[]): Resident[] => {
  return [...residents].sort((a, b) => {
    // Sort by priority (higher number = higher priority)
    // If priority is the same or undefined, sort alphabetically
    const priorityA = a.priority || 0;
    const priorityB = b.priority || 0;
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    
    // If priorities are equal, sort alphabetically
    return a.name.localeCompare(b.name);
  });
}; 