import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from "./ui/button";
import { Resident } from '../services/supabase';
import AllMailboxLabels from './AllMailboxLabels';
import MailboxLabel from './MailboxLabel';
import { groupResidentsByApartment, sortResidentsByPriority } from '../utils/residentUtils';
import { LoadingCard } from './ui/loader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

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

  // Create filename for single label
  const singleLabelFilename = (apartmentNumber: string) => 
    `postkassamerki_ibud_${apartmentNumber}${buildingName ? '_' + buildingName.toLowerCase().replace(/\s+/g, '_') : ''}.pdf`;
  
  // Create title for the card
  const title = buildingName ? buildingName : 'Allar íbúðir';

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
                <TableHead className="w-28 text-center" style={{ whiteSpace: 'normal' }}>Sækja merki</TableHead>
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
                          className="transition-all hover:bg-primary/10 w-full sm:w-auto"
                        >
                          {loading ? 'Hleð...' : 'Sækja'}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MailboxLabelsViewer; 