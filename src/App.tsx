import { useState } from 'react'
import './App.css'
import { Button } from "@/components/ui/button"
import PDFViewer from './components/PDFViewer'
import { Resident, fetchResidents } from './services/googleSheets'
import { sampleResidents } from './data/sampleData'

function App() {
  const [residents, setResidents] = useState<Resident[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentType, setDocumentType] = useState<'residentList' | 'mailboxLabels'>('residentList')
  const [hasData, setHasData] = useState(false)

  // Get environment variables
  const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY
  const sheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID
  const sheetIndex = Number(import.meta.env.VITE_GOOGLE_SHEETS_INDEX || 0)

  // Check if environment variables are configured
  const isConfigured = Boolean(apiKey && sheetId)

  const fetchData = async () => {
    if (!isConfigured) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await fetchResidents(
        sheetId as string,
        apiKey as string,
        sheetIndex
      )
      
      setResidents(data)
      setHasData(true)
    } catch (err) {
      console.error('Error fetching residents:', err)
      setError('Villa kom upp við að sækja gögn. Vinsamlegast athugaðu stillingar og reyndu aftur.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadSampleData = () => {
    setResidents(sampleResidents)
    setHasData(true)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">ResidencyNow</h1>
        <p className="text-gray-600">
          Búðu til íbúalista og póstkassamerki frá Google Sheets
        </p>
      </header>

      {!hasData ? (
        <div className="max-w-md mx-auto">
          {isConfigured ? (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-center">Google Sheets tenging</h2>
              <p className="mb-4 text-sm text-gray-600">
                Stillingarnar þínar eru tilbúnar. Smelltu á hnappinn til að sækja gögn frá Google Sheets.
              </p>
              <Button 
                className="w-full mb-4" 
                onClick={fetchData}
                disabled={isLoading}
              >
                {isLoading ? 'Hleð...' : 'Sækja gögn frá Google Sheets'}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">- eða -</p>
                <Button 
                  variant="outline" 
                  onClick={loadSampleData}
                >
                  Prófa með sýnigögnum
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-center">Stillingar vantar</h2>
              <p className="mb-4 text-sm text-gray-600">
                Þú þarft að stilla umhverfisbreytur fyrir Google Sheets tengingu. 
                Sjá leiðbeiningar í README skjalinu.
              </p>
              <div className="bg-yellow-50 p-4 rounded border border-yellow-200 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">Stillingar sem vantar:</h3>
                <ul className="list-disc pl-5 text-sm text-yellow-700">
                  {!apiKey && <li>VITE_GOOGLE_SHEETS_API_KEY</li>}
                  {!sheetId && <li>VITE_GOOGLE_SHEETS_ID</li>}
                </ul>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={loadSampleData}
              >
                Prófa með sýnigögnum
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {documentType === 'residentList' ? 'Íbúalisti' : 'Póstkassamerki'}
            </h2>
            
            <div className="flex gap-4">
              <Button
                variant={documentType === 'residentList' ? 'default' : 'outline'}
                onClick={() => setDocumentType('residentList')}
              >
                Íbúalisti
              </Button>
              
              <Button
                variant={documentType === 'mailboxLabels' ? 'default' : 'outline'}
                onClick={() => setDocumentType('mailboxLabels')}
              >
                Póstkassamerki
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setHasData(false)}
              >
                Breyta stillingum
              </Button>
            </div>
          </div>
          
          <PDFViewer residents={residents} documentType={documentType} />
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  )
}

export default App
