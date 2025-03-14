import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Resident, groupResidentsByApartment } from '../services/googleSheets';

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
    padding: 10,
    fontFamily: 'Fira Sans',
  },
  header: {
    marginBottom: 15,
    padding: 5,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buildingName: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  labelContainer: {
    width: '50%',
    height: '33.33%',
    padding: 5,
    boxSizing: 'border-box',
  },
  label: {
    border: '1px solid #000',
    padding: 10,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  apartmentNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  residentName: {
    fontSize: 10,
    marginBottom: 2,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});

interface MailboxLabelsProps {
  residents: Resident[];
  buildingName?: string;
}

// Create Document Component
const MailboxLabels: React.FC<MailboxLabelsProps> = ({ residents, buildingName }) => {
  // Handle empty residents array
  if (!residents || residents.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={{ width: '100%', padding: 20 }}>
            <Text style={styles.emptyMessage}>Engar upplýsingar um íbúa fundust.</Text>
          </View>
        </Page>
      </Document>
    );
  }

  try {
    // Group residents by apartment number
    const groupedResidents = groupResidentsByApartment(residents);
    
    // Convert the grouped residents object to an array for rendering
    const apartmentEntries = Object.entries(groupedResidents).map(
      ([apartmentNumber, residents]) => ({
        apartmentNumber,
        residents,
      })
    );

    // Handle case where grouping resulted in no entries
    if (apartmentEntries.length === 0) {
      return (
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={{ width: '100%', padding: 20 }}>
              <Text style={styles.emptyMessage}>Engar upplýsingar um íbúðir fundust.</Text>
            </View>
          </Page>
        </Document>
      );
    }

    // Calculate how many labels fit on a page (6 per page: 2 columns x 3 rows)
    const labelsPerPage = 6;
    const totalPages = Math.ceil(apartmentEntries.length / labelsPerPage);
    
    // Create an array of pages
    const pages = Array.from({ length: totalPages }, (_, pageIndex) => {
      const startIndex = pageIndex * labelsPerPage;
      const pageLabels = apartmentEntries.slice(startIndex, startIndex + labelsPerPage);
      
      return (
        <Page key={`page-${pageIndex}`} size="A4" style={styles.page}>
          {/* Header with title and building name */}
          <View style={styles.header}>
            <Text style={styles.title}>Póstkassamerki</Text>
            {buildingName && <Text style={styles.buildingName}>{buildingName}</Text>}
          </View>
          
          {/* Labels container */}
          <View style={styles.labelsContainer}>
            {pageLabels.map((entry, index) => (
              <View key={`label-${entry.apartmentNumber}-${index}`} style={styles.labelContainer}>
                <View style={styles.label}>
                  <Text style={styles.apartmentNumber}>Íbúð {entry.apartmentNumber}</Text>
                  {entry.residents.map((resident, resIndex) => (
                    <Text key={`resident-${entry.apartmentNumber}-${resIndex}-${resident.name}`} style={styles.residentName}>
                      {resident.name}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </Page>
      );
    });

    return <Document>{pages}</Document>;
  } catch (error) {
    console.error('Error rendering mailbox labels:', error);
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={{ width: '100%', padding: 20 }}>
            <Text style={styles.emptyMessage}>Villa kom upp við að búa til póstkassamerki.</Text>
          </View>
        </Page>
      </Document>
    );
  }
};

export default MailboxLabels; 