import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Resident } from '../services/supabase';
import { sortResidentsByPriority } from '../utils/residentUtils';

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

// Create styles for the mailbox label
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

interface MailboxLabelProps {
  apartmentNumber: string;
  residents: Resident[];
}

// Component for a single mailbox label
const MailboxLabel: React.FC<MailboxLabelProps> = ({ apartmentNumber, residents }) => {
  // Sort residents by priority if available
  const sortedResidents = sortResidentsByPriority(residents);

  return (
    <Document>
      <Page size={[198, 141]} style={styles.page}>
        <View style={styles.label}>
          <Text style={styles.apartmentNumber}>{apartmentNumber}</Text>
          {sortedResidents.map((resident, index) => (
            <Text key={index} style={styles.residentName}>
              {resident.name}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default MailboxLabel; 