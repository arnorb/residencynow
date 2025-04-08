import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Resident } from '../services/supabase';
import { sortResidentsByName } from '../utils/residentUtils';
import QRCode from 'qrcode';

// Import font files directly
import FiraSansRegular from '../assets/fonts/FiraSans-Regular.ttf';
import FiraSansBold from '../assets/fonts/FiraSans-Bold.ttf';
import FiraSansLight from '../assets/fonts/FiraSans-Light.ttf';
import FiraSansMedium from '../assets/fonts/FiraSans-Medium.ttf';

// Register Fira Sans font
Font.register({
  family: 'Fira Sans',
  fonts: [
    { src: FiraSansRegular },
    { src: FiraSansBold, fontWeight: 'bold' },
    { src: FiraSansLight, fontWeight: 'light' },
    { src: FiraSansMedium, fontWeight: 'medium' },
  ]
});

// QR Code component for React PDF
interface QRCodeProps {
  value: string;
  size?: number;
}

const PDFQRCode: React.FC<QRCodeProps> = ({ value, size = 60 }) => {
  const [imageData, setImageData] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Generate QR code as a data URL
        const dataUrl = await QRCode.toDataURL(value, {
          margin: 1,
          width: size,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        setImageData(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };
    
    generateQRCode();
  }, [value, size]);

  return imageData ? (
    <Image src={imageData} style={{ width: size, height: size }} />
  ) : null;
};

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    fontSize: 10,
    color: '#666',
  },
  footerDate: {
    textAlign: 'left',
    alignSelf: 'flex-end',
  },
  qrCodeContainer: {
    alignItems: 'center',
  },
  qrCodeText: {
    fontSize: 8,
    marginTop: 5,
    textAlign: 'center',
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

  // URL for QR code
  const qrCodeUrl = "mailto:arnarhlid2@gmail.com";

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
        
        <View style={styles.footer}>
          <Text style={styles.footerDate}>
            Útprentað: {new Date().toLocaleDateString('is-IS')}
          </Text>
          <View style={styles.qrCodeContainer}>
            <PDFQRCode value={qrCodeUrl} size={60} />
            <Text style={styles.qrCodeText}>Breytingar</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ResidentList; 