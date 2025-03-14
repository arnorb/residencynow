import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Resident } from '../services/googleSheets';
import { groupResidentsByApartment } from '../services/googleSheets';

// Create styles for the mailbox labels
const styles = StyleSheet.create({
  page: {
    width: '7cm',
    height: '5cm',
    padding: '0.5cm',
    backgroundColor: '#ffffff',
  },
  label: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: '1pt solid #cccccc',
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
      {apartmentNumbers.map((apartmentNumber) => (
        <Page key={apartmentNumber} size={[198, 141]} style={styles.page}>
          <View style={styles.label}>
            <Text style={styles.apartmentNumber}>Íbúð {apartmentNumber}</Text>
            {groupedResidents[apartmentNumber].map((resident, index) => (
              <Text key={index} style={styles.residentName}>
                {resident.name}
              </Text>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default AllMailboxLabels; 