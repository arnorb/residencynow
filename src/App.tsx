import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./components/ui/select"
import PDFViewer from './components/PDFViewer'
import MailboxLabelsViewer from './components/MailboxLabelsViewer'
import ResidentManager from './components/ResidentManager'
import { Resident, Building, fetchResidents, fetchBuildings } from './services/supabase'
import { sampleResidents } from './data/sampleData'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'
import { Button } from './components/ui/button'

function App() {
  const [residents, setResidents] = useState<Resident[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedBuildingId, setSelectedBuildingId] = useState<number>(0)
  const [isFetchingResidents, setIsFetchingResidents] = useState(false)
  const [isBuildingsLoading, setIsBuildingsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasBuildingSelection, setHasBuildingSelection] = useState(false)
  const { logout, user, isAuthenticated } = useAuth()

  // Define logout button component
  const LogoutButton = () => (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={logout}
      className="absolute top-4 right-4"
    >
      Útskrá
    </Button>
  );

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
        console.log('Successfully fetched buildings data:', data);
        setBuildings(data)
        setHasBuildingSelection(true)
        
        // Set default selected building to the first one
        setSelectedBuildingId(data[0].id)
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
  }, [loadSampleData, setBuildings, setError, setHasBuildingSelection, setIsBuildingsLoading, setSelectedBuildingId])

  // Fetch buildings on component mount
  useEffect(() => {
    fetchBuildingsList();
  }, [fetchBuildingsList]);

  // Effect to fetch residents when building changes
  useEffect(() => {
    if (selectedBuildingId && hasBuildingSelection) {
      fetchData()
    }
  }, [selectedBuildingId, hasBuildingSelection, fetchData])

  // Add a useEffect to re-fetch data when authentication state changes
  useEffect(() => {
    // When a user becomes authenticated, refetch the buildings data
    if (isAuthenticated && user) {
      console.log('User authenticated, fetching buildings data');
      fetchBuildingsList();
    }
  }, [isAuthenticated, user, fetchBuildingsList]);

  // Get the selected building name
  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId)

  // Callback function to refresh residents data after changes
  const handleResidentsChange = useCallback(() => {
    fetchData()
  }, [fetchData])

  // Create a loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-600">Hleð Habitera...</p>
        <p className="text-sm text-gray-500 mt-2">Sæki byggingar</p>
      </div>
    </div>
  );

  // If still loading buildings, show the spinner in a protected route
  if (isBuildingsLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto py-8 relative">
          <LogoutButton />
          
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Habitera</h1>
            <p className="text-gray-600">
              Íbúalisti og póstkassamerki
            </p>
          </header>
          
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    )
  }

  // Render the main UI once buildings are loaded
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 relative">
        <LogoutButton />
        
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Habitera</h1>
          <p className="text-gray-600">
            Íbúalisti og póstkassamerki
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Íbúalisti</h2>
              {selectedBuilding && (
                <p className="text-sm text-gray-500">
                  {selectedBuilding.title}
                </p>
              )}
              {!selectedBuilding && (
                <p className="text-sm text-gray-500">
                  Sýnigögn
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <label htmlFor="building-select" className="text-sm text-gray-500 mb-1">
                  Veldu byggingu
                </label>
                {buildings.length > 0 ? (
                  <Select
                    value={selectedBuildingId.toString()}
                    onValueChange={(value) => {
                      const newBuildingId = parseInt(value);
                      
                      // Optimistic UI update - show loading indicator before actual data load
                      setIsFetchingResidents(true);
                      
                      // Clear current residents to avoid showing stale data
                      setResidents([]);
                      
                      // Update the building ID which will trigger the fetchData effect
                      setSelectedBuildingId(newBuildingId);
                    }}
                  >
                    <SelectTrigger className="w-[180px]" id="building-select">
                      <SelectValue placeholder="Veldu byggingu" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map((building) => (
                        <SelectItem key={building.id} value={building.id.toString()}>
                          {building.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="w-[180px] h-10 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500">
                    Engar byggingar fundust
                  </div>
                )}
              </div>
              {isFetchingResidents && (
                <div className="ml-2 text-sm text-gray-500">
                  Hleð gögnum...
                </div>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="residents" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
              <TabsTrigger value="residents" className="text-center">
                <span className="hidden sm:inline">Íbúalisti</span>
                <span className="sm:hidden">Íbúar</span>
              </TabsTrigger>
              <TabsTrigger value="mailboxes" className="text-center">
                <span className="hidden sm:inline">Póstkassamerki</span>
                <span className="sm:hidden">Merki</span>
              </TabsTrigger>
              <TabsTrigger value="manage" className="text-center">
                <span className="hidden sm:inline">Breyta gögnum</span>
                <span className="sm:hidden">Breyta</span>
              </TabsTrigger>
            </TabsList>
            
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
              />
            </TabsContent>
            
            <TabsContent value="manage">
              <ResidentManager
                buildingId={selectedBuildingId}
                buildingName={selectedBuilding?.title || "Sýnigögn"}
                onResidentsChange={handleResidentsChange}
              />
            </TabsContent>
          </Tabs>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

export default App
