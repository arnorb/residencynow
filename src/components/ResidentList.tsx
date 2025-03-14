import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Resident, sortResidentsByName } from '../services/googleSheets';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  residentList: {
    marginTop: 20,
  },
  residentItem: {
    flexDirection: 'row',
    marginBottom: 5,
    fontSize: 12,
  },
  name: {
    flex: 3,
  },
  apartmentNumber: {
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
});

interface ResidentListProps {
  residents: Resident[];
  title?: string;
  subtitle?: string;
}

// Create Document Component
const ResidentList: React.FC<ResidentListProps> = ({ residents, title = 'Íbúalisti', subtitle = 'Raðað í stafrófsröð' }) => {
  // Sort residents alphabetically by name
  const sortedResidents = sortResidentsByName(residents);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        
        <View style={styles.residentList}>
          {sortedResidents.map((resident, index) => (
            <View key={index} style={styles.residentItem}>
              <Text style={styles.name}>{resident.name}</Text>
              <Text style={styles.apartmentNumber}>{resident.apartmentNumber}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.footer}>
          Útprentað: {new Date().toLocaleDateString('is-IS')}
        </Text>
      </Page>
    </Document>
  );
};

export default ResidentList; 