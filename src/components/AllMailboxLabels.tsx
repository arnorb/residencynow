import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Resident } from '../services/googleSheets';
import { groupResidentsByApartment, sortResidentsByPriority } from '../services/googleSheets';

// Register Fira Sans font
Font.register({
  family: 'Fira Sans',
  src: 'https://fonts.gstatic.com/s/firasans/v16/va9E4kDNxMZdWfMOD5Vvl4jL.ttf',
  fontWeight: 'normal',
});

Font.register({
  family: 'Fira Sans',
  src: 'https://fonts.gstatic.com/s/firasans/v16/va9B4kDNxMZdWfMOD5VnSKzeRhf_.ttf',
  fontWeight: 'bold',
});

// Create styles for the mailbox labels
const styles = StyleSheet.create({
  page: {
    width: '7cm',
    height: '5cm',
    padding: '0.5cm',
    backgroundColor: '#ffffff',
    fontFamily: 'Fira Sans',
  },
  label: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '0.3cm',
  },
  apartmentNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: '0.3cm',
    textAlign: 'center',
  },
  residentName: {
    fontSize: 11,
    marginBottom: '0.1cm',
    textAlign: 'center',
  }
});

interface AllMailboxLabelsProps {
  residents: Resident[];
}

// Component for all mailbox labels in a single document
const AllMailboxLabels: React.FC<AllMailboxLabelsProps> = ({ residents }) => {
  // Group residents by apartment number
  const groupedResidents = groupResidentsByApartment(residents);
  
  // Sort apartment numbers numerically
  const apartmentNumbers = Object.keys(groupedResidents).sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });

  return (
    <Document>
      {apartmentNumbers.map((apartmentNumber) => {
        // Sort residents by priority if available
        const sortedResidents = sortResidentsByPriority(groupedResidents[apartmentNumber]);
        
        return (
          <Page key={apartmentNumber} size={[198, 141]} style={styles.page}>
            <View style={styles.label}>
              <Text style={styles.apartmentNumber}>Íbúð {apartmentNumber}</Text>
              {sortedResidents.map((resident, index) => (
                <Text key={index} style={styles.residentName}>
                  {resident.name}
                </Text>
              ))}
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export default AllMailboxLabels; 