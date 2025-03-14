import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Resident } from '../services/googleSheets';

// Create styles for the mailbox label
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

interface MailboxLabelProps {
  apartmentNumber: string;
  residents: Resident[];
}

// Component for a single mailbox label
const MailboxLabel: React.FC<MailboxLabelProps> = ({ apartmentNumber, residents }) => {
  return (
    <Document>
      <Page size={[198, 141]} style={styles.page}>
        <View style={styles.label}>
          <Text style={styles.apartmentNumber}>Íbúð {apartmentNumber}</Text>
          {residents.map((resident, index) => (
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