import { useState, useEffect } from 'react'
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

function App() {
  const [residents, setResidents] = useState<Resident[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedBuildingId, setSelectedBuildingId] = useState<number>(0)
  const [isFetchingResidents, setIsFetchingResidents] = useState(false)
  const [isBuildingsLoading, setIsBuildingsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasBuildingSelection, setHasBuildingSelection] = useState(false)

  // Fetch buildings on component mount
  useEffect(() => {
    fetchBuildingsList();
  }, []);

  // Fetch buildings from Supabase
  const fetchBuildingsList = async () => {
    setIsBuildingsLoading(true)
    setError(null)
    
    try {
      const data = await fetchBuildings()
      
      setBuildings(data)
      setHasBuildingSelection(data.length > 0)
      
      // Set default selected building to the first one
      if (data.length > 0) {
        setSelectedBuildingId(data[0].id)
      } else {
        // If no buildings found, load sample data automatically
        loadSampleData()
      }
    } catch (err) {
      console.error('Error fetching buildings:', err)
      setError('Villa kom upp við að sækja byggingar. Vinsamlegast reyndu aftur.')
      // Load sample data if there's an error
      loadSampleData()
    } finally {
      setIsBuildingsLoading(false)
    }
  }

  // Fetch residents for the selected building
  const fetchData = async () => {
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
  }

  // Load sample data for testing
  const loadSampleData = () => {
    setResidents(sampleResidents)
  }

  // Effect to fetch residents when building changes
  useEffect(() => {
    if (selectedBuildingId && hasBuildingSelection) {
      fetchData()
    }
  }, [selectedBuildingId, hasBuildingSelection])

  // Get the selected building name
  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId)

  // Callback function to refresh residents data after changes
  const handleResidentsChange = () => {
    fetchData()
  }

  // Show loading indicator while fetching initial data
  if (isBuildingsLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">ResidencyNow</h1>
          <p className="text-gray-600">
            Íbúalisti og póstkassamerki
          </p>
        </header>
        <div className="flex justify-center items-center h-64">
          <p>Hleð gögnum...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">ResidencyNow</h1>
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
          
          {buildings.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <label htmlFor="building-select" className="text-sm text-gray-500 mb-1">
                  Veldu byggingu
                </label>
                <Select
                  value={selectedBuildingId.toString()}
                  onValueChange={(value) => {
                    const newBuildingId = parseInt(value);
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
              </div>
              {isFetchingResidents && (
                <div className="ml-2 text-sm text-gray-500">
                  Hleð gögnum...
                </div>
              )}
            </div>
          )}
        </div>
        
        <Tabs defaultValue="residents" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="residents">Íbúalisti</TabsTrigger>
            <TabsTrigger value="mailboxes">Póstkassamerki</TabsTrigger>
            <TabsTrigger value="manage">Breyta gögnum</TabsTrigger>
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
  )
}

export default App
