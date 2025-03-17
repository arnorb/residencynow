import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from "../components/ui/button";
import { Resident } from '../services/supabase';
import AllMailboxLabels from './AllMailboxLabels';
import MailboxLabel from './MailboxLabel';
import { groupResidentsByApartment, sortResidentsByPriority } from '../utils/residentUtils';
import { Loader, LoadingCard } from './ui/loader';

interface MailboxLabelsViewerProps {
  residents: Resident[];
  buildingName?: string;
  isLoading?: boolean;
}

const MailboxLabelsViewer: React.FC<MailboxLabelsViewerProps> = ({ 
  residents, 
  buildingName,
  isLoading = false 
}) => {
  // Group residents by apartment number
  const groupedResidents = groupResidentsByApartment(residents);
  
  // Sort apartment numbers numerically
  const apartmentNumbers = Object.keys(groupedResidents).sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });

  // Generate filename for all labels
  const allLabelsFilename = buildingName 
    ? `${buildingName.toLowerCase().replace(/\s+/g, '-')}-all-mailbox-labels.pdf`
    : 'all-mailbox-labels.pdf';

  // Generate filename for individual label
  const singleLabelFilename = (apartmentNumber: string) => {
    return buildingName 
      ? `${buildingName.toLowerCase().replace(/\s+/g, '-')}-apt-${apartmentNumber}-label.pdf`
      : `apt-${apartmentNumber}-label.pdf`;
  };

  // Card view for mobile
  const MobileMailboxCard = ({ apartmentNumber }: { apartmentNumber: string }) => {
    const residents = groupedResidents[apartmentNumber];
    return (
      <div className="bg-white rounded-lg border mb-3 p-4 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium text-lg mb-1">Íbúð {apartmentNumber}</h3>
            <div className="text-sm text-gray-700 mb-2">
              {sortResidentsByPriority(residents).map((resident, index, array) => (
                <span key={index}>
                  {resident.name}{index < array.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
          <div className="ml-4">
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
                <Button size="sm" variant="outline" disabled={loading}>
                  {loading ? 'Hleð...' : 'Sækja'}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="w-1/3">
            <Loader variant="skeleton" height="h-5" />
          </div>
          <div className="w-32">
            <Loader variant="skeleton" height="h-9" />
          </div>
        </div>
        <div className="space-y-3">
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </div>
      </div>
    );
  }

  // Empty state for when there are no residents
  if (residents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
        <div className="text-center py-8">
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
          <p className="text-lg font-medium text-gray-700 mb-1">Engir íbúar fundust</p>
          <p className="text-sm text-gray-500">
            Engin póstkassamerki hægt að sýna þar sem engir íbúar eru skráðir í bygginguna.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <p className="text-sm text-gray-600 order-2 sm:order-1">
          Hér getur þú skoðað og sótt póstkassamerki fyrir hverja íbúð.
        </p>
        <PDFDownloadLink
          document={<AllMailboxLabels residents={residents} />}
          fileName={allLabelsFilename}
          className="no-underline w-full sm:w-auto order-1 sm:order-2"
        >
          {({ loading }) => (
            <Button 
              disabled={loading} 
              className="w-full sm:w-auto text-sm h-9"
            >
              {loading ? 'Hleð...' : 'Sækja öll merki'}
            </Button>
          )}
        </PDFDownloadLink>
      </div>
      
      {/* Mobile View */}
      <div className="sm:hidden">
        {apartmentNumbers.map((apartmentNumber) => (
          <MobileMailboxCard key={apartmentNumber} apartmentNumber={apartmentNumber} />
        ))}
      </div>
      
      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-4 py-2 text-left">Íbúð</th>
              <th className="border px-4 py-2 text-left">Íbúar</th>
              <th className="border px-4 py-2 text-center">Sækja merki</th>
            </tr>
          </thead>
          <tbody>
            {apartmentNumbers.map((apartmentNumber) => (
              <tr key={apartmentNumber} className="hover:bg-gray-50">
                <td className="border px-4 py-2 font-medium">
                  {apartmentNumber}
                </td>
                <td className="border px-4 py-2 text-left">
                  {sortResidentsByPriority(groupedResidents[apartmentNumber]).map((resident, index, array) => (
                    <span key={index} className="text-sm">
                      {resident.name}{index < array.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </td>
                <td className="border px-4 py-2 text-center">
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
                      <Button size="sm" variant="outline" disabled={loading}>
                        {loading ? 'Hleð...' : 'Sækja'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MailboxLabelsViewer; 