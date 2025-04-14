import React, { useState, useEffect, ErrorInfo } from 'react';
import { PDFViewer as ReactPDFViewer, PDFDownloadLink, Font } from '@react-pdf/renderer';
import ResidentList from './ResidentList';
import { Resident } from '../services/supabase';
import { Button } from "./ui/button";

// Font files will be loaded via fetch API

// Import font files directly to ensure they're bundled
import FiraSansRegular from '../assets/fonts/FiraSans-Regular.ttf';
import FiraSansBold from '../assets/fonts/FiraSans-Bold.ttf';
import FiraSansLight from '../assets/fonts/FiraSans-Light.ttf';
import FiraSansMedium from '../assets/fonts/FiraSans-Medium.ttf';

// Preload fonts to ensure they're available
const preloadFonts = async () => {
  try {
    // Register fonts directly - now that we have the Buffer polyfill, this should work
    await Font.register({
      family: 'Fira Sans',
      fonts: [
        { src: FiraSansRegular },
        { src: FiraSansBold, fontWeight: 'bold' },
        { src: FiraSansLight, fontWeight: 'light' },
        { src: FiraSansMedium, fontWeight: 'medium' },
      ]
    });
    // console.log('Fonts preloaded successfully');
    return true;
  } catch (error) {
    console.error('Error preloading fonts:', error);
    return false;
  }
};

// Helper function to create a safe filename from a string
const createSafeFilename = (input: string | undefined): string => {
  // Get current date in YYYY-MM-DD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(now.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  if (!input) return `${dateString}_ibualisti.pdf`;
  
  // Replace Icelandic characters with safe alternatives
  const normalizedString = input
    .replace(/á/g, 'a')
    .replace(/Á/g, 'A')
    .replace(/é/g, 'e')
    .replace(/É/g, 'E')
    .replace(/í/g, 'i')
    .replace(/Í/g, 'I')
    .replace(/ó/g, 'o')
    .replace(/Ó/g, 'O')
    .replace(/ú/g, 'u')
    .replace(/Ú/g, 'U')
    .replace(/ý/g, 'y')
    .replace(/Ý/g, 'Y')
    .replace(/þ/g, 'th')
    .replace(/Þ/g, 'Th')
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'Ae')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ð/g, 'd')
    .replace(/Ð/g, 'D');
  
  // Remove any other special characters and replace spaces with underscores
  const safeString = normalizedString
    .replace(/[^\w\s.-]/g, '')  // Remove any non-alphanumeric characters except spaces, dots, and hyphens
    .replace(/\s+/g, '_')       // Replace spaces with underscores
    .replace(/__+/g, '_')       // Replace multiple underscores with a single one
    .trim();                    // Trim any leading/trailing whitespace
  
  // Add the date and PDF extension
  return safeString ? `${dateString}_ibualisti_${safeString}.pdf` : `${dateString}_ibualisti.pdf`;
};

// Error boundary class component to catch errors in PDF rendering
class PDFErrorBoundary extends React.Component<
  { children: React.ReactNode, onError: (error: Error, errorInfo: ErrorInfo) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode, onError: (error: Error, errorInfo: ErrorInfo) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">Villa kom upp við að búa til PDF skjal.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

interface PDFViewerProps {
  residents: Resident[];
  buildingName?: string;
}

// Download icon component
const DownloadIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
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
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" 
    />
  </svg>
);

const PDFViewer: React.FC<PDFViewerProps> = ({ residents, buildingName }) => {
  const [renderError, setRenderError] = useState<string | null>(null);
  const [key, setKey] = useState<number>(0); // Key to force re-render
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [fontLoadingError, setFontLoadingError] = useState<string | null>(null);

  // Reset error when props change
  useEffect(() => {
    setRenderError(null);
    setKey(prevKey => prevKey + 1); // Force re-render when props change
  }, [buildingName]);

  // Preload fonts when component mounts
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const success = await preloadFonts();
        if (success) {
          setFontsLoaded(true);
          setFontLoadingError(null);
        } else {
          setFontLoadingError('Villa við að hlaða leturgerðum. Vinsamlegast reyndu aftur.');
        }
      } catch (error) {
        console.error('Error in font loading:', error);
        setFontLoadingError('Villa við að hlaða leturgerðum. Vinsamlegast reyndu aftur.');
      }
    };
    
    loadFonts();
  }, []);

  // Check if fonts are registered
  useEffect(() => {
    try {
      // Check if Fira Sans is registered
      const registeredFonts = Font.getRegisteredFontFamilies();
      const firaSansRegistered = registeredFonts.includes('Fira Sans');
      
      if (!firaSansRegistered) {
        console.warn('Fira Sans font not registered yet');
        setFontLoadingError('Leturgerðir ekki hlaðnar. Vinsamlegast reyndu aftur.');
      } else {
        // console.log('Fira Sans font registered successfully');
        setFontsLoaded(true);
        setFontLoadingError(null);
      }
    } catch (error) {
      console.error('Error checking font registration:', error);
    }
  }, []);

  // Create the document component
  const documentComponent = <ResidentList residents={residents} buildingName={buildingName} />;
  
  // Generate a safe filename based on the building name
  const documentName = createSafeFilename(buildingName);

  // Error handling function for PDF rendering
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error rendering PDF:', error, errorInfo);
    
    // Check for font-related errors
    const errorMessage = error.message || '';
    if (
      errorMessage.includes('font') || 
      errorMessage.includes('Font') || 
      errorMessage.toLowerCase().includes('leturgerð') ||
      errorMessage.includes('404')
    ) {
      setRenderError('Villa kom upp við að hlaða leturgerðum. Vinsamlegast reyndu aftur.');
    } else {
      setRenderError('Villa kom upp við að búa til PDF skjal. Vinsamlegast reyndu aftur.');
    }
  };

  // Determine if the download button should be disabled
  const isDownloadDisabled = !fontsLoaded || residents.length === 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-end items-center mb-4">
        <PDFDownloadLink 
          document={documentComponent}
          fileName={documentName}
          className="no-underline"
          onClick={() => setRenderError(null)}
        >
          {({ loading, error }) => {
            if (error) handleError(error);
            return (
              <Button 
                disabled={isDownloadDisabled || loading} 
                className="h-10 w-full sm:w-auto"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-pulse mr-2">...</span>
                    Hleð...
                  </span>
                ) : error ? (
                  'Villa kom upp'
                ) : (
                  <span className="flex items-center">
                    <DownloadIcon className="mr-2" />
                    Hlaða niður PDF
                  </span>
                )}
              </Button>
            );
          }}
        </PDFDownloadLink>
      </div>

      {(renderError || fontLoadingError) && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {renderError || fontLoadingError}
        </div>
      )}
      
      <div className="border rounded-md overflow-hidden" style={{ height: '70vh' }}>
        {residents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Engar upplýsingar um íbúa fundust.</p>
          </div>
        ) : !fontsLoaded && fontLoadingError ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">{fontLoadingError}</p>
          </div>
        ) : (
          <PDFErrorBoundary onError={handleError} key={key}>
            <ReactPDFViewer 
              style={{ width: '100%', height: '100%' }}
            >
              {documentComponent}
            </ReactPDFViewer>
          </PDFErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default PDFViewer; 