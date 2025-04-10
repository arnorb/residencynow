import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Resident } from '../services/supabase';
import { groupResidentsByApartment, sortResidentsByPriority } from '../utils/residentUtils';

// Import font files directly
import FiraSansRegular from '../assets/fonts/FiraSans-Regular.ttf';
import FiraSansBold from '../assets/fonts/FiraSans-Bold.ttf';

// Register Fira Sans font
Font.register({
  family: 'Fira Sans',
  fonts: [
    { src: FiraSansRegular, fontWeight: 'normal' },
    { src: FiraSansBold, fontWeight: 'bold' }
  ]
});

// Create styles for the mailbox labels
const styles = StyleSheet.create({
  page: {
    width: '9cm',
    height: '3.8cm',
    padding: '0.3cm',
    backgroundColor: '#ffffff',
    fontFamily: 'Fira Sans',
  },
  label: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '0.1cm',
  },
  apartmentNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: '0.1cm',
    textAlign: 'left',
  },
  residentName: {
    fontSize: 11,
    marginBottom: '0.1cm',
    textAlign: 'left',
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
          <Page key={apartmentNumber} size={[255.12, 107.72]} style={styles.page}>
            <View style={styles.label}>
              <Text style={styles.apartmentNumber}>{apartmentNumber}</Text>
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