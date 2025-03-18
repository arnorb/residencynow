import { PDFDownloadLink } from '@react-pdf/renderer';
import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Resident, updateResident } from '../services/supabase';
import AllMailboxLabels from './AllMailboxLabels';
import MailboxLabel from './MailboxLabel';
import { groupResidentsByApartment, sortResidentsByPriority } from '../utils/residentUtils';
import { LoadingCard } from './ui/loader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MailboxLabelsViewerProps {
  residents: Resident[];
  buildingName?: string;
  isLoading?: boolean;
  buildingId: number;
  onResidentsChange?: () => void;
}

// Component for a single draggable resident
const SortableResident = ({ resident, position }: { resident: Resident, position: number }) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition 
  } = useSortable({ id: resident.id?.toString() || '' });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="bg-white p-3 mb-2 rounded-md shadow-sm border border-gray-200 cursor-move flex justify-between items-center"
    >
      <div className="flex items-center">
        <div className="bg-gray-200 text-gray-700 w-7 h-7 rounded-full flex items-center justify-center mr-3">
          {position + 1}
        </div>
        <span className="font-medium">{resident.name}</span>
      </div>
    </div>
  );
};

const MailboxLabelsViewer: React.FC<MailboxLabelsViewerProps> = ({ 
  residents, 
  buildingName,
  isLoading = false,
  buildingId,
  onResidentsChange
}) => {
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortedResidents, setSortedResidents] = useState<Resident[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debug useEffect for tracking dialog state
  useEffect(() => {
    console.log("Dialog state changed:", { isDialogOpen, selectedApartment });
  }, [isDialogOpen, selectedApartment]);
  
  // Group residents by apartment number
  const groupedResidents = groupResidentsByApartment(residents);
  
  // Sort apartment numbers numerically
  const apartmentNumbers = Object.keys(groupedResidents).sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });

  // Create filename for single label
  const singleLabelFilename = (apartmentNumber: string) => 
    `postkassamerki_ibud_${apartmentNumber}${buildingName ? '_' + buildingName.toLowerCase().replace(/\s+/g, '_') : ''}.pdf`;
  
  // Create title for the card
  const title = buildingName ? buildingName : 'Allar íbúðir';
  
  // Handle opening the sorting dialog
  const handleOpenSortDialog = (apartmentNumber: string) => {
    console.log("Opening sort dialog for apartment:", apartmentNumber);
    setSelectedApartment(apartmentNumber);
    setSortedResidents(sortResidentsByPriority(groupedResidents[apartmentNumber]));
    setIsModified(false);
    setIsDialogOpen(true);
  };
  
  // Set up drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    setSortedResidents((items) => {
      const oldIndex = items.findIndex(item => item.id?.toString() === active.id);
      const newIndex = items.findIndex(item => item.id?.toString() === over.id);
      
      const reordered = arrayMove(items, oldIndex, newIndex);
      setIsModified(true);
      return reordered;
    });
  };
  
  // Save the new resident priorities
  const handleSavePriorities = async () => {
    if (!selectedApartment) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Update all residents with new priority values
      const updatePromises = sortedResidents.map((resident, index) => {
        if (resident.id) {
          return updateResident(resident.id, { 
            priority: index,
            name: resident.name,
            apartmentNumber: resident.apartmentNumber
          });
        }
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises);
      
      // Log the buildingId for debugging purposes
      console.log(`Updated priorities for residents in building: ${buildingId}`);
      
      if (onResidentsChange) {
        onResidentsChange();
      }
      
      setIsModified(false);
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error updating priorities:", err);
      setError('Villa kom upp við að vista forgangsröð. Vinsamlegast reyndu aftur.');
    } finally {
      setIsSaving(false);
    }
  };

  // Card view for mobile
  const MobileMailboxCard = ({ apartmentNumber }: { apartmentNumber: string }) => {
    const residents = groupedResidents[apartmentNumber];
    return (
      <Card className="mb-3 transition-all hover:shadow-md">
        <CardContent className="p-4 pt-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg px-3 py-1 bg-gray-100 inline-block rounded mb-2">Íbúð {apartmentNumber}</h3>
              <div className="text-sm text-gray-700 mb-2 text-left">
                {sortResidentsByPriority(residents).map((resident, index, array) => (
                  <span key={index}>
                    {resident.name}{index < array.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex ml-4 gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  console.log("Opening dialog for apartment:", apartmentNumber);
                  handleOpenSortDialog(apartmentNumber);
                }}
                className="h-10 px-4 transition-all hover:bg-primary/10"
              >
                Raða
              </Button>
              <PDFDownloadLink
                document={
                  <MailboxLabel 
                    apartmentNumber={apartmentNumber} 
                    residents={residents} 
                  />
                }
                fileName={singleLabelFilename(apartmentNumber)}
                className="no-underline"
              >
                {({ loading }) => (
                  <Button size="sm" variant="outline" disabled={loading}
                    className="h-10 px-4 transition-all hover:bg-primary/10">
                    {loading ? 'Hleð...' : 'Sækja'}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className="shadow-md overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="space-y-3 px-4 sm:px-0">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state for when there are no residents
  if (residents.length === 0) {
    return (
      <Card className="shadow-md overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 mx-auto text-gray-400 mb-3" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
            />
          </svg>
          <CardTitle className="text-lg font-medium text-gray-700 mb-1">Engir íbúar fundust</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Engin póstkassamerki hægt að sýna þar sem engir íbúar eru skráðir í bygginguna.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-md overflow-hidden">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle>{title}</CardTitle>
            <PDFDownloadLink
              document={
                <AllMailboxLabels
                  residents={residents}
                />
              }
              fileName={`postkassamerki_${buildingName ? buildingName.toLowerCase().replace(/\s+/g, '_') : 'oll'}.pdf`}
              className="no-underline"
            >
              {({ loading }) => (
                <Button disabled={loading} className="h-10 w-full sm:w-auto">
                  {loading ? 'Hleð...' : 'Sækja öll merki'}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </CardHeader>
        
        <CardContent className="px-0 sm:px-6">
          {/* Mobile View */}
          <div className="sm:hidden px-4">
            {apartmentNumbers.map((apartmentNumber) => (
              <MobileMailboxCard key={apartmentNumber} apartmentNumber={apartmentNumber} />
            ))}
          </div>
          
          {/* Desktop View */}
          <div className="hidden sm:block">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24 text-center pl-6" style={{ whiteSpace: 'normal' }}>Íbúð</TableHead>
                  <TableHead className="text-left" style={{ whiteSpace: 'normal' }}>Íbúar</TableHead>
                  <TableHead className="w-56 text-center" style={{ whiteSpace: 'normal' }}>Aðgerðir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apartmentNumbers.map((apartmentNumber) => (
                  <TableRow key={apartmentNumber} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-medium text-center pl-6">
                      {apartmentNumber}
                    </TableCell>
                    <TableCell className="!whitespace-normal text-left">
                      <div className="line-clamp-2">
                        {sortResidentsByPriority(groupedResidents[apartmentNumber]).map((resident, index, array) => (
                          <span key={index} className="text-sm">
                            {resident.name}{index < array.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            console.log("Opening dialog for apartment:", apartmentNumber);
                            handleOpenSortDialog(apartmentNumber);
                          }}
                          className="transition-all hover:bg-primary/10"
                        >
                          Raða
                        </Button>
                        <PDFDownloadLink
                          document={
                            <MailboxLabel 
                              apartmentNumber={apartmentNumber} 
                              residents={groupedResidents[apartmentNumber]} 
                            />
                          }
                          fileName={singleLabelFilename(apartmentNumber)}
                          className="no-underline"
                        >
                          {({ loading }) => (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              disabled={loading}
                              className="transition-all hover:bg-primary/10"
                            >
                              {loading ? 'Hleð...' : 'Sækja'}
                            </Button>
                          )}
                        </PDFDownloadLink>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Sorting Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          console.log("Dialog open state change:", open);
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[550px] z-50 bg-white">
          {selectedApartment && (
            <>
              <DialogHeader>
                <DialogTitle>Röðun íbúa í íbúð {selectedApartment}</DialogTitle>
                <DialogDescription>
                  Dragðu nöfn til að raða - nöfn efst á lista birtast fyrst á póstkassamerki
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-2">
                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
                    {error}
                  </div>
                )}
                
                <div className="w-full">
                  <div className={`mt-4 ${isSaving ? 'opacity-70' : ''}`}>
                    {sortedResidents.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        Engir íbúar skráðir í þessa íbúð
                      </p>
                    ) : (
                      <DndContext 
                        sensors={sensors} 
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext 
                          items={sortedResidents.map(r => r.id?.toString() || '')}
                          strategy={verticalListSortingStrategy}
                        >
                          {sortedResidents.map((resident, index) => (
                            <SortableResident 
                              key={resident.id} 
                              resident={resident} 
                              position={index}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </div>
              </div>
              
              {isSaving && (
                <div className="absolute inset-0 bg-background/30 z-50 flex items-center justify-center rounded-lg">
                  <div className="p-2 bg-background/80 rounded-full shadow-lg">
                    <svg 
                      className="animate-spin h-6 w-6 text-primary" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      ></circle>
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <div className="flex w-full justify-between gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSaving}
                    className="w-full sm:w-auto transition-all hover:bg-primary/10"
                  >
                    Hætta við
                  </Button>
                  
                  <Button 
                    onClick={handleSavePriorities}
                    disabled={!isModified || isSaving}
                    className="w-full sm:w-auto transition-all hover:bg-primary/90"
                  >
                    {isSaving ? 'Vista...' : 'Vista breytingar'}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MailboxLabelsViewer; 