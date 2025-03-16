import { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "../components/ui/dialog";
import { 
  Resident, 
  fetchResidents, 
  createResident, 
  updateResident, 
  deleteResident 
} from '../services/supabase';

interface ResidentManagerProps {
  buildingId: number;
  buildingName?: string;
  onResidentsChange?: () => void;
}

const ResidentManager: React.FC<ResidentManagerProps> = ({ 
  buildingId, 
  buildingName,
  onResidentsChange 
}) => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for adding/editing residents
  const [isEditing, setIsEditing] = useState(false);
  const [currentResident, setCurrentResident] = useState<Partial<Resident>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Load residents when building changes
  useEffect(() => {
    if (buildingId) {
      loadResidents();
    }
  }, [buildingId, onResidentsChange]);
  
  // Load residents from Supabase
  const loadResidents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchResidents(buildingId);
      setResidents(data);
    } catch (err) {
      console.error('Error loading residents:', err);
      setError('Villa kom upp við að sækja íbúa. Vinsamlegast reyndu aftur.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'priority') {
      // Handle priority as a number or undefined
      setCurrentResident({
        ...currentResident,
        [name]: value === '' ? undefined : parseInt(value)
      });
    } else {
      setCurrentResident({
        ...currentResident,
        [name]: value
      });
    }
  };
  
  // Reset form
  const resetForm = () => {
    setCurrentResident({});
    setIsEditing(false);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentResident.name || !currentResident.apartmentNumber) {
      setError('Nafn og íbúðarnúmer eru nauðsynleg');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (isEditing && currentResident.id) {
        // Update existing resident
        const { name, apartmentNumber, priority } = currentResident;
        await updateResident(currentResident.id, { name, apartmentNumber, priority });
      } else {
        // Create new resident
        await createResident({
          name: currentResident.name || '',
          apartmentNumber: currentResident.apartmentNumber || '',
          priority: currentResident.priority,
          building_id: buildingId
        });
      }
      
      // Reload residents and reset form
      await loadResidents();
      
      // Notify parent component about the change
      if (onResidentsChange) {
        onResidentsChange();
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error saving resident:', err);
      setError('Villa kom upp við að vista íbúa. Vinsamlegast reyndu aftur.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle edit button click
  const handleEdit = (resident: Resident) => {
    setCurrentResident(resident);
    setIsEditing(true);
    setIsDialogOpen(true);
  };
  
  // Handle delete button click
  const handleDelete = async (id: number) => {
    if (!window.confirm('Ertu viss um að þú viljir eyða þessum íbúa?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteResident(id);
      await loadResidents();
      
      // Notify parent component about the change
      if (onResidentsChange) {
        onResidentsChange();
      }
    } catch (err) {
      console.error('Error deleting resident:', err);
      setError('Villa kom upp við að eyða íbúa. Vinsamlegast reyndu aftur.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle add button click
  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Íbúar {buildingName && `- ${buildingName}`}</h2>
        <Button onClick={handleAdd}>Bæta við íbúa</Button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {isLoading && residents.length === 0 ? (
        <div className="text-center py-8">Hleð...</div>
      ) : residents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Engir íbúar fundust. Bættu við íbúa með því að smella á "Bæta við íbúa" hnappinn.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nafn</TableHead>
                <TableHead>Íbúð</TableHead>
                <TableHead>Forgangur</TableHead>
                <TableHead className="text-right">Aðgerðir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residents.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell>{resident.name}</TableCell>
                  <TableCell>{resident.apartmentNumber}</TableCell>
                  <TableCell>{resident.priority !== undefined ? resident.priority : '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(resident)}
                      >
                        Breyta
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => resident.id && handleDelete(resident.id)}
                      >
                        Eyða
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Breyta íbúa' : 'Bæta við íbúa'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid w-full items-center gap-2">
                <label htmlFor="name" className="text-sm font-medium">Nafn</label>
                <Input
                  id="name"
                  name="name"
                  value={currentResident.name || ''}
                  onChange={handleInputChange}
                  placeholder="Nafn íbúa"
                  required
                />
              </div>
              
              <div className="grid w-full items-center gap-2">
                <label htmlFor="apartmentNumber" className="text-sm font-medium">Íbúð</label>
                <Input
                  id="apartmentNumber"
                  name="apartmentNumber"
                  value={currentResident.apartmentNumber || ''}
                  onChange={handleInputChange}
                  placeholder="Númer íbúðar"
                  required
                />
              </div>
              
              <div className="grid w-full items-center gap-2">
                <label htmlFor="priority" className="text-sm font-medium">Forgangur (valfrjálst)</label>
                <Input
                  id="priority"
                  name="priority"
                  type="number"
                  value={currentResident.priority === undefined ? '' : currentResident.priority}
                  onChange={handleInputChange}
                  placeholder="Forgangur (lægri tala = hærri forgangur)"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
              >
                Hætta við
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Hleð...' : isEditing ? 'Vista breytingar' : 'Bæta við'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResidentManager; 