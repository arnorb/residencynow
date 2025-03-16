import React, { useState, useEffect, ErrorInfo } from 'react';
import { PDFViewer as ReactPDFViewer, PDFDownloadLink, Font } from '@react-pdf/renderer';
import ResidentList from './ResidentList';
import { Resident } from '../services/supabase';

// Import font files directly to ensure they're bundled
import FiraSansRegular from '../assets/fonts/FiraSans-Regular.ttf';
import FiraSansBold from '../assets/fonts/FiraSans-Bold.ttf';
import FiraSansLight from '../assets/fonts/FiraSans-Light.ttf';
import FiraSansMedium from '../assets/fonts/FiraSans-Medium.ttf';

// Preload fonts to ensure they're available
const preloadFonts = async () => {
  try {
    // Register fonts here as a fallback in case they weren't registered elsewhere
    await Font.register({
      family: 'Fira Sans',
      fonts: [
        { src: FiraSansRegular },
        { src: FiraSansBold, fontWeight: 'bold' },
        { src: FiraSansLight, fontWeight: 'light' },
        { src: FiraSansMedium, fontWeight: 'medium' },
      ]
    });
    console.log('Fonts preloaded successfully');
    return true;
  } catch (error) {
    console.error('Error preloading fonts:', error);
    return false;
  }
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
        console.log('Fira Sans font registered successfully');
        setFontsLoaded(true);
        setFontLoadingError(null);
      }
    } catch (error) {
      console.error('Error checking font registration:', error);
    }
  }, []);

  // Create the document component
  const documentComponent = <ResidentList residents={residents} buildingName={buildingName} />;
  
  // Set document name
  const documentName = 'ibualisti.pdf';

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-end items-center mb-4">
        <PDFDownloadLink 
          document={documentComponent}
          fileName={documentName}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${!fontsLoaded ? 'opacity-50 pointer-events-none' : 'hover:bg-primary/90'} bg-primary text-primary-foreground h-10 px-4 py-2`}
          onClick={() => setRenderError(null)}
        >
          {({ loading, error }) => {
            if (error) handleError(error);
            return loading ? 'Hleð...' : error ? 'Villa kom upp' : 'Hlaða niður PDF';
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