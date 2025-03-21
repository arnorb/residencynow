import { useState, useEffect, useCallback } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { 
  Resident, 
  fetchResidents, 
  createResident, 
  updateResident, 
  deleteResident,
  createMultipleResidents
} from '../services/supabase';
import { Loader, LoadingCard } from "./ui/loader";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ResidentManagerProps {
  buildingId: number;
  buildingName?: string;
  onResidentsChange?: () => void;
}

// Interface for multiple residents input
interface MultipleResidentsInput {
  apartmentNumber: string;
  names: string;
}

// Edit icon component
const EditIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" 
    />
  </svg>
);

// Trash icon component
const TrashIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" 
    />
  </svg>
);

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
  
  // State for multiple residents dialog
  const [isMultipleDialogOpen, setIsMultipleDialogOpen] = useState(false);
  const [multipleResidentsInput, setMultipleResidentsInput] = useState<MultipleResidentsInput>({
    apartmentNumber: '',
    names: ''
  });
  
  // Load residents from Supabase - wrapped in useCallback
  const loadResidents = useCallback(async () => {
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
  }, [buildingId]);
  
  // Load residents when building changes
  useEffect(() => {
    if (buildingId) {
      loadResidents();
    }
  }, [buildingId, loadResidents]);
  
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
  
  // Handle multiple residents input changes
  const handleMultipleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMultipleResidentsInput({
      ...multipleResidentsInput,
      [name]: value
    });
  };
  
  // Reset form
  const resetForm = () => {
    setCurrentResident({});
    setIsEditing(false);
  };
  
  // Reset multiple residents form
  const resetMultipleForm = () => {
    setMultipleResidentsInput({
      apartmentNumber: '',
      names: ''
    });
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
  
  // Handle multiple residents form submission
  const handleMultipleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { apartmentNumber, names } = multipleResidentsInput;
    
    if (!apartmentNumber || !names.trim()) {
      setError('Íbúðarnúmer og að minnsta kosti eitt nafn eru nauðsynleg');
      return;
    }
    
    // Split names by newline and filter out empty lines
    const namesList = names
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (namesList.length === 0) {
      setError('Að minnsta kosti eitt nafn er nauðsynlegt');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create an array of resident objects
      const newResidents = namesList.map((name, index) => ({
        name,
        apartmentNumber,
        priority: index, // Set priority based on order (first name has highest priority)
        building_id: buildingId
      }));
      
      // Create multiple residents
      await createMultipleResidents(newResidents);
      
      // Reload residents and reset form
      await loadResidents();
      
      // Notify parent component about the change
      if (onResidentsChange) {
        onResidentsChange();
      }
      
      resetMultipleForm();
      setIsMultipleDialogOpen(false);
    } catch (err) {
      console.error('Error saving multiple residents:', err);
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
  
  // Handle add multiple button click
  const handleAddMultiple = () => {
    resetMultipleForm();
    setIsMultipleDialogOpen(true);
  };

  // Card view for mobile screens - Updated with shadcn Card
  const MobileResidentCard = ({ resident }: { resident: Resident }) => (
    <Card className="mb-3 transition-all hover:shadow-md">
      <CardContent className="p-4 pt-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm bg-gray-100 px-2 py-1 rounded">Íbúð: {resident.apartmentNumber}</span>
              {resident.priority !== undefined && (
                <span className="text-xs text-gray-500">Forgangur: {resident.priority}</span>
              )}
            </div>
            <h3 className="font-medium text-left">{resident.name}</h3>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-[80px] h-10 transition-all hover:bg-primary/10 text-sm"
              onClick={() => handleEdit(resident)}
            >
              Breyta
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="w-[80px] h-10 border-red-500 text-red-500 transition-all hover:bg-red-500 hover:text-white text-sm"
              onClick={() => resident.id && handleDelete(resident.id)}
            >
              Eyða
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <Card className="shadow-md">
      <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle className="text-xl font-semibold">Íbúar {buildingName && `- ${buildingName}`}</CardTitle>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              onClick={handleAddMultiple} 
              variant="outline" 
              className="text-sm px-2 py-1 h-9 flex-grow sm:flex-grow-0 transition-all hover:bg-primary/10"
            >
              Bæta við mörgum
            </Button>
            <Button 
              onClick={handleAdd} 
              className="text-sm px-3 py-1 h-9 flex-grow sm:flex-grow-0 transition-all hover:bg-primary/90"
            >
              Bæta við íbúa
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 pt-0">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        
        {isLoading && residents.length === 0 ? (
          <div className="py-4">
            <Loader text="Hleð..." fullWidth />
            <div className="mt-6 space-y-3">
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </div>
          </div>
        ) : residents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Engir íbúar fundust. Bættu við íbúa með því að smella á "Bæta við íbúa" hnappinn.
          </div>
        ) : (
          <>
            {/* Mobile view - card layout */}
            <div className="block sm:hidden">
              {residents.map((resident) => (
                <MobileResidentCard key={resident.id} resident={resident} />
              ))}
            </div>
            
            {/* Desktop view - table layout */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 text-center">Íbúð</TableHead>
                    <TableHead className="text-left">Nafn</TableHead>
                    <TableHead className="w-24 text-center">Forgangur</TableHead>
                    <TableHead className="w-[160px] text-center">Aðgerðir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {residents.map((resident) => (
                    <TableRow key={resident.id} className="transition-colors">
                      <TableCell className="text-center">{resident.apartmentNumber}</TableCell>
                      <TableCell className="text-left">{resident.name}</TableCell>
                      <TableCell className="text-center">{resident.priority !== undefined ? resident.priority : '-'}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(resident)}
                            className="transition-all hover:bg-primary/10"
                            aria-label="Breyta"
                          >
                            <EditIcon />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => resident.id && handleDelete(resident.id)}
                            className="border-red-500 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                            aria-label="Eyða"
                          >
                            <TrashIcon />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
      
      {/* Single Resident Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[90vw] max-w-[90vw] rounded-lg" aria-describedby="resident-form-description">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Breyta íbúa' : 'Bæta við íbúa'}</DialogTitle>
            <DialogDescription id="resident-form-description">
              {isEditing ? 'Uppfærðu upplýsingar um íbúa' : 'Sláðu inn upplýsingar um nýjan íbúa'}
            </DialogDescription>
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
            
            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
                className="w-full sm:w-auto transition-all hover:bg-primary/10"
              >
                Hætta við
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full sm:w-auto transition-all hover:bg-primary/90"
              >
                {isLoading ? 'Hleð...' : isEditing ? 'Vista breytingar' : 'Bæta við'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Multiple Residents Dialog */}
      <Dialog open={isMultipleDialogOpen} onOpenChange={setIsMultipleDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[90vw] max-w-[90vw] rounded-lg" aria-describedby="multiple-residents-form-description">
          <DialogHeader>
            <DialogTitle>Bæta við mörgum íbúum</DialogTitle>
            <DialogDescription id="multiple-residents-form-description">
              Settu inn upplýsingar um marga íbúa, einn íbúa í hverja línu
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleMultipleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid w-full items-center gap-2">
                <label htmlFor="apartmentNumber" className="text-sm font-medium">Íbúð</label>
                <Input
                  id="apartmentNumber"
                  name="apartmentNumber"
                  value={multipleResidentsInput.apartmentNumber}
                  onChange={handleMultipleInputChange}
                  placeholder="Númer íbúðar"
                  required
                />
              </div>
              
              <div className="grid w-full items-center gap-2">
                <label htmlFor="names" className="text-sm font-medium">
                  Nöfn íbúa (eitt nafn í hverja línu)
                </label>
                <textarea
                  id="names"
                  name="names"
                  value={multipleResidentsInput.names}
                  onChange={handleMultipleInputChange}
                  placeholder="Jón Jónsson&#10;Anna Guðmundsdóttir&#10;Guðrún Sigurðardóttir"
                  required
                  rows={6}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-gray-500">
                  Fyrsta nafn fær hæstan forgang, síðan í röð þar á eftir.
                </p>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetMultipleForm();
                  setIsMultipleDialogOpen(false);
                }}
                className="w-full sm:w-auto transition-all hover:bg-primary/10"
              >
                Hætta við
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full sm:w-auto transition-all hover:bg-primary/90"
              >
                {isLoading ? 'Hleð...' : 'Bæta við'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ResidentManager; 