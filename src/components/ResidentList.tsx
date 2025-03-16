import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Resident, sortResidentsByName } from '../services/googleSheets';

// Register Fira Sans font
Font.register({
  family: 'Fira Sans',
  fonts: [
    { src: '/src/assets/fonts/FiraSans-Regular.ttf' },
    { src: '/src/assets/fonts/FiraSans-Bold.ttf', fontWeight: 'bold' },
    { src: '/src/assets/fonts/FiraSans-Light.ttf', fontWeight: 'light' },
    { src: '/src/assets/fonts/FiraSans-Medium.ttf', fontWeight: 'medium' },
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Fira Sans',
  },
  title: {
    fontSize: 24,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buildingName: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#555',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'center',
    color: '#707070',
  },
  columnsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
    gap: 30,
    justifyContent: 'space-between',
  },
  column: {
    width: 'calc(50% - 15px)',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    fontSize: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
  },
  tableHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  nameColumn: {
    width: '70%',
  },
  apartmentColumn: {
    width: '30%',
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
  buildingName?: string;
}

// Create Document Component
const ResidentList: React.FC<ResidentListProps> = ({ 
  residents,
  subtitle = 'Veljið númer íbúðar og ýtið á bjöllutáknið',
  buildingName 
}) => {
  // Sort residents alphabetically by name
  const sortedResidents = sortResidentsByName(residents);
  
  // Split residents into two columns
  const midpoint = Math.ceil(sortedResidents.length / 2);
  const leftColumnResidents = sortedResidents.slice(0, midpoint);
  const rightColumnResidents = sortedResidents.slice(midpoint);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{buildingName}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        
        <View style={styles.columnsContainer}>
          {/* Left Column */}
          <View style={styles.column}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.nameColumn}>Nafn</Text>
              <Text style={styles.apartmentColumn}>Íbúð</Text>
            </View>
            
            {leftColumnResidents.map((resident, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.nameColumn}>{resident.name}</Text>
                <Text style={styles.apartmentColumn}>{resident.apartmentNumber}</Text>
              </View>
            ))}
          </View>
          
          {/* Right Column */}
          <View style={styles.column}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.nameColumn}>Nafn</Text>
              <Text style={styles.apartmentColumn}>Íbúð</Text>
            </View>
            
            {rightColumnResidents.map((resident, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.nameColumn}>{resident.name}</Text>
                <Text style={styles.apartmentColumn}>{resident.apartmentNumber}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <Text style={styles.footer}>
          Útprentað: {new Date().toLocaleDateString('is-IS')}. Sendið póst á arnarhlid@gmail.com fyrir breytingar.
        </Text>
      </Page>
    </Document>
  );
};

export default ResidentList; 