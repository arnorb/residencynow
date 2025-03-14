import React, { useState, useEffect, ErrorInfo } from 'react';
import { PDFViewer as ReactPDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import ResidentList from './ResidentList';
import MailboxLabels from './MailboxLabels';
import { Resident } from '../services/googleSheets';

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
  documentType: 'residentList' | 'mailboxLabels';
  buildingName?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ residents, documentType, buildingName }) => {
  const [renderError, setRenderError] = useState<string | null>(null);
  const [key, setKey] = useState<number>(0); // Key to force re-render

  // Reset error when document type changes
  useEffect(() => {
    setRenderError(null);
    setKey(prevKey => prevKey + 1); // Force re-render when document type changes
  }, [documentType]);

  // Determine which document to render based on documentType
  const documentComponent = documentType === 'residentList' 
    ? <ResidentList residents={residents} buildingName={buildingName} /> 
    : <MailboxLabels residents={residents} buildingName={buildingName} />;
  
  // Set document name and title based on documentType
  const documentName = documentType === 'residentList' ? 'ibualisti.pdf' : 'postkassamerki.pdf';
  const documentTitle = documentType === 'residentList' ? 'Íbúalisti' : 'Póstkassamerki';

  // Error handling function for PDF rendering
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error rendering PDF:', error, errorInfo);
    setRenderError('Villa kom upp við að búa til PDF skjal. Vinsamlegast reyndu aftur.');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{documentTitle}</h3>
        
        <PDFDownloadLink 
          document={documentComponent}
          fileName={documentName}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          onClick={() => setRenderError(null)}
        >
          {({ loading, error }) => {
            if (error) handleError(error);
            return loading ? 'Hleð...' : error ? 'Villa kom upp' : 'Hlaða niður PDF';
          }}
        </PDFDownloadLink>
      </div>

      {renderError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {renderError}
        </div>
      )}
      
      <div className="border rounded-md overflow-hidden" style={{ height: '70vh' }}>
        {residents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Engar upplýsingar um íbúa fundust.</p>
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