import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from "../components/ui/button";
import { Resident } from '../services/googleSheets';
import { groupResidentsByApartment, sortResidentsByPriority } from '../services/googleSheets';
import AllMailboxLabels from './AllMailboxLabels';
import MailboxLabel from './MailboxLabel';

interface MailboxLabelsViewerProps {
  residents: Resident[];
  buildingName?: string;
}

const MailboxLabelsViewer: React.FC<MailboxLabelsViewerProps> = ({ residents, buildingName }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-end items-center mb-4">
        <PDFDownloadLink
          document={<AllMailboxLabels residents={residents} />}
          fileName={allLabelsFilename}
          className="no-underline"
        >
          {({ loading }) => (
            <Button disabled={loading}>
              {loading ? 'Hleð...' : 'Sækja öll merki'}
            </Button>
          )}
        </PDFDownloadLink>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Hér getur þú skoðað og sótt póstkassamerki fyrir hverja íbúð.
      </p>
      
      <div className="overflow-x-auto">
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
                <td className="border px-4 py-2">
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