import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import MailboxLabelsViewer from '../MailboxLabelsViewer';

describe('MailboxLabelsViewer - Loading States', () => {
  it('should display empty state message when no residents are present', () => {
    render(<MailboxLabelsViewer residents={[]} buildingName="Test Building" />);
    
    // Check if empty state is displayed
    expect(screen.getByText('Engir íbúar fundust')).toBeInTheDocument();
    expect(screen.getByText(/Engin póstkassamerki hægt að sýna/i)).toBeInTheDocument();
  });
  
  it('should display residents when data is available', () => {
    const mockResidents = [
      { id: 1, name: 'John Doe', apartmentNumber: '101', building_id: 1 },
      { id: 2, name: 'Jane Smith', apartmentNumber: '101', building_id: 1 },
      { id: 3, name: 'Bob Johnson', apartmentNumber: '102', building_id: 1 }
    ];
    
    render(<MailboxLabelsViewer residents={mockResidents} buildingName="Test Building" />);
    
    // Check if resident data is displayed using getAllByText to handle duplicates
    const johnDoeElements = screen.getAllByText(/John Doe/i);
    const janeSmithElements = screen.getAllByText(/Jane Smith/i);
    const bobJohnsonElements = screen.getAllByText(/Bob Johnson/i);
    
    expect(johnDoeElements.length).toBeGreaterThan(0);
    expect(janeSmithElements.length).toBeGreaterThan(0);
    expect(bobJohnsonElements.length).toBeGreaterThan(0);
    
    // Check if download buttons are present
    expect(screen.getAllByText('Sækja').length).toBeGreaterThan(0);
    expect(screen.getByText('Sækja öll merki')).toBeInTheDocument();
  });
  
  it('should have mobile-friendly card layout for smaller screens', () => {
    const mockResidents = [
      { id: 1, name: 'John Doe', apartmentNumber: '101', building_id: 1 }
    ];
    
    render(<MailboxLabelsViewer residents={mockResidents} buildingName="Test Building" />);
    
    // Check if mobile card view elements exist
    // We'll look for elements with the appropriate class names for mobile view
    const mobileView = document.querySelector('.sm\\:hidden');
    expect(mobileView).not.toBeNull();
    
    // Check if the element inside mobile view contains resident info
    if (mobileView) {
      const textContent = mobileView.textContent || '';
      expect(textContent).toContain('John Doe');
      expect(textContent).toContain('101');
    }
  });
  
  it('should display loading state when isLoading is true', () => {
    render(<MailboxLabelsViewer residents={[]} buildingName="Test Building" isLoading={true} />);
    
    // Check for loading skeleton elements - Skeleton elements don't have data-testid
    const skeletonElements = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletonElements.length).toBeGreaterThan(0);
    
    // Verify that the empty state message is not shown during loading
    expect(screen.queryByText('Engir íbúar fundust')).not.toBeInTheDocument();
  });
}); 