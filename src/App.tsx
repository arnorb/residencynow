import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "./components/ui/dialog"
import PDFViewer from './components/PDFViewer'
import MailboxLabelsViewer from './components/MailboxLabelsViewer'
import ResidentManager from './components/ResidentManager'
import { Resident, Building, fetchResidents, fetchBuildings } from './services/supabase'
import { sampleResidents } from './data/sampleData'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'
import { Button } from './components/ui/button'
import { Header } from './components/Header'
import { BuildingSelector } from './components/BuildingSelector'

function App() {
  const [residents, setResidents] = useState<Resident[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedBuildingId, setSelectedBuildingId] = useState<number>(() => {
    // Try to get the last selected building from localStorage
    const savedBuildingId = localStorage.getItem('lastSelectedBuilding');
    return savedBuildingId ? parseInt(savedBuildingId) : 0;
  });
  const [isFetchingResidents, setIsFetchingResidents] = useState(false)
  const [isBuildingsLoading, setIsBuildingsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasBuildingSelection, setHasBuildingSelection] = useState(false)
  const [showBuildingModal, setShowBuildingModal] = useState<boolean>(false)
  const { user, isAuthenticated } = useAuth()

  // Load sample data for testing
  const loadSampleData = useCallback(() => {
    setResidents(sampleResidents)
  }, [])

  // Fetch residents for the selected building
  const fetchData = useCallback(async () => {
    if (!selectedBuildingId) return
    
    setIsFetchingResidents(true)
    setError(null)
    
    try {
      const data = await fetchResidents(selectedBuildingId)
      
      setResidents(data)
    } catch (err) {
      console.error('Error fetching residents:', err)
      setError('Villa kom upp við að sækja gögn. Vinsamlegast reyndu aftur.')
      // Load sample data if there's an error
      loadSampleData()
    } finally {
      setIsFetchingResidents(false)
    }
  }, [selectedBuildingId, setError, setIsFetchingResidents, setResidents, loadSampleData])

  // Fetch buildings from Supabase
  const fetchBuildingsList = useCallback(async () => {
    setIsBuildingsLoading(true)
    setError(null)
    
    try {
      const data = await fetchBuildings()
      
      // Check if we got actual data back (not an empty array)
      if (data && data.length > 0) {
        // console.log('Successfully fetched buildings data:', data);
        // Sort buildings by name and then by number
        const sortedData = [...data].sort((a, b) => {
          // Extract name and number parts safely
          const aMatch = a.title.match(/^(.*?)(\d+)?$/) || ['', a.title, ''];
          const bMatch = b.title.match(/^(.*?)(\d+)?$/) || ['', b.title, ''];
          const aName = aMatch[1] || '';
          const bName = bMatch[1] || '';
          const aNum = aMatch[2] || '';
          const bNum = bMatch[2] || '';
          
          // First compare the names
          const nameComparison = aName.localeCompare(bName);
          if (nameComparison !== 0) return nameComparison;
          
          // If names are equal, compare the numbers
          const numA = aNum ? parseInt(aNum) : 0;
          const numB = bNum ? parseInt(bNum) : 0;
          return numA - numB;
        });
        setBuildings(sortedData)
        setHasBuildingSelection(true)
        
        // Check if this is the first visit (no building selected)
        const savedBuildingId = localStorage.getItem('lastSelectedBuilding');
        if (!savedBuildingId) {
          setShowBuildingModal(true);
        } else if (!selectedBuildingId) {
          // Only set default building if no building is selected but we have a saved one
          setSelectedBuildingId(parseInt(savedBuildingId))
        }
      } else {
        console.warn('No buildings found or empty response');
        // If no buildings found, load sample data
        setHasBuildingSelection(false)
        loadSampleData()
      }
    } catch (err) {
      console.error('Error fetching buildings:', err)
      setError('Villa kom upp við að sækja byggingar. Vinsamlegast reyndu aftur.')
      // Load sample data if there's an error
      setHasBuildingSelection(false)
      loadSampleData()
    } finally {
      setIsBuildingsLoading(false)
    }
  }, [loadSampleData, setBuildings, setError, setHasBuildingSelection, setIsBuildingsLoading, setSelectedBuildingId, selectedBuildingId])

  // Save selected building to localStorage whenever it changes
  useEffect(() => {
    if (selectedBuildingId) {
      localStorage.setItem('lastSelectedBuilding', selectedBuildingId.toString());
    }
  }, [selectedBuildingId]);

  // Fetch buildings on component mount
  useEffect(() => {
    // Only fetch buildings if user is authenticated
    if (isAuthenticated && user) {
      fetchBuildingsList();
    }
  }, [fetchBuildingsList, isAuthenticated, user]);

  // Effect to fetch residents when building changes
  useEffect(() => {
    if (selectedBuildingId && hasBuildingSelection && isAuthenticated) {
      fetchData()
    }
  }, [selectedBuildingId, hasBuildingSelection, fetchData, isAuthenticated])

  // Get the selected building name
  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId)

  // Handle building selection from the modal
  const handleBuildingSelection = (buildingId: number) => {
    setSelectedBuildingId(buildingId);
    setShowBuildingModal(false);
  };
  
  // Prevent modal from closing if no building is selected
  const handleModalOpenChange = (open: boolean) => {
    // Only allow closing if a building is already selected
    if (!open && !selectedBuildingId && !localStorage.getItem('lastSelectedBuilding')) {
      // Keep modal open if trying to close without a selection
      return;
    }
    setShowBuildingModal(open);
  };

  // Callback function to refresh residents data after changes
  const handleResidentsChange = useCallback(() => {
    fetchData()
  }, [fetchData])

  // Render the main UI (whether or not buildings are loaded)
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto py-8 px-8 mt-[72px] md:mt-[88px]">
          <div className="max-w-4xl mx-auto">
            {!isAuthenticated ? (
              // Show authentication loading state
              <div className="animate-pulse mb-8">
                <div className="h-12 bg-gray-200 rounded w-64"></div>
                <div className="mt-4 text-sm text-gray-500">Auðkenning í gangi...</div>
              </div>
            ) : isBuildingsLoading ? (
              // Show a placeholder while buildings are loading
              <div className="animate-pulse mb-8">
                <div className="h-12 bg-gray-200 rounded w-64"></div>
              </div>
            ) : (
              // Show actual content once buildings are loaded
              <>
                <BuildingSelector
                  buildings={buildings}
                  selectedBuildingId={selectedBuildingId}
                  onBuildingSelect={(buildingId) => {
                    // Optimistic UI update - show loading indicator before actual data load
                    setIsFetchingResidents(true);
                    
                    // Clear current residents to avoid showing stale data
                    setResidents([]);
                    
                    // Update the building ID which will trigger the fetchData effect
                    setSelectedBuildingId(buildingId);
                  }}
                  isLoading={isFetchingResidents}
                  className="mb-8"
                />
                
                <Tabs defaultValue="manage" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
                    <TabsTrigger value="manage" className="text-center">
                      <span className="hidden sm:inline">Breyta gögnum</span>
                      <span className="sm:hidden">Breyta</span>
                    </TabsTrigger>
                    <TabsTrigger value="residents" className="text-center">
                      <span className="hidden sm:inline">Íbúalisti</span>
                      <span className="sm:hidden">Íbúar</span>
                    </TabsTrigger>
                    <TabsTrigger value="mailboxes" className="text-center">
                      <span className="hidden sm:inline">Póstkassamerki</span>
                      <span className="sm:hidden">Merki</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="manage">
                    <ResidentManager
                      buildingId={selectedBuildingId}
                      buildingName={selectedBuilding?.title || "Sýnigögn"}
                      onResidentsChange={handleResidentsChange}
                    />
                  </TabsContent>
                  
                  <TabsContent value="residents">
                    <PDFViewer 
                      residents={residents} 
                      buildingName={selectedBuilding?.title || "Sýnigögn"}
                    />
                  </TabsContent>
                  
                  <TabsContent value="mailboxes">
                    <MailboxLabelsViewer
                      residents={residents}
                      buildingName={selectedBuilding?.title || "Sýnigögn"}
                      isLoading={isFetchingResidents}
                      onResidentsChange={handleResidentsChange}
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Building Selection Modal */}
          <Dialog open={showBuildingModal} onOpenChange={handleModalOpenChange}>
            <DialogContent className="sm:max-w-md p-0 [&>button]:hidden" aria-describedby="building-selection-description">
              <DialogHeader className="px-6 pt-6 pb-4 border-b">
                <DialogTitle>Veldu byggingu</DialogTitle>
                <DialogDescription id="building-selection-description">
                  Vinsamlegast veldu byggingu til að skoða íbúa og póstkassamerki.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-6 max-h-[50vh] overflow-y-auto pr-6 sm:grid-cols-2">
                {buildings.map((building) => (
                  <Button
                    key={building.id}
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => handleBuildingSelection(building.id)}
                  >
                    {building.title}
                  </Button>
                ))}
              </div>
              <DialogFooter className="px-6 py-4 border-t">
                <DialogDescription className="text-xs">
                  Þú getur alltaf breytt um byggingu síðar með því að nota fellivalmyndina efst á síðunni.
                </DialogDescription>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default App
