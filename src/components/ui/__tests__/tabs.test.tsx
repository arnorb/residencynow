import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

describe('Tabs Component - Mobile Responsiveness', () => {
  it('should render tabs with appropriate mobile-friendly classes', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    
    // Check if the TabsList has proper responsive classes
    const tabsList = container.querySelector('[data-slot="tabs-list"]');
    expect(tabsList).not.toBeNull();
    
    if (tabsList) {
      // Check for responsive height classes
      expect(tabsList.className).toContain('h-auto');
      expect(tabsList.className).toContain('min-h-10');
      expect(tabsList.className).toContain('sm:h-9');
      
      // Check for full width
      expect(tabsList.className).toContain('w-full');
    }
    
    // Check if the TabsTrigger has proper responsive classes
    const tabsTrigger = container.querySelector('[data-slot="tabs-trigger"]');
    expect(tabsTrigger).not.toBeNull();
    
    if (tabsTrigger) {
      // Check for responsive text size classes
      expect(tabsTrigger.className).toContain('text-xs');
      expect(tabsTrigger.className).toContain('sm:text-sm');
      
      // Check for responsive padding
      expect(tabsTrigger.className).toContain('py-2');
      expect(tabsTrigger.className).toContain('sm:py-1');
      
      // Check for minimum height for touch targets
      expect(tabsTrigger.className).toContain('min-h-9');
    }
    
    // Verify content renders correctly
    expect(container.textContent).toContain('Tab 1');
    expect(container.textContent).toContain('Content 1');
  });
  
  it('should support conditional content rendering for mobile/desktop views', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" className="text-center">
            <span className="hidden sm:inline">Desktop Label</span>
            <span className="sm:hidden">Mobile</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );
    
    // Verify both mobile and desktop labels are in the DOM
    // (CSS will hide one or the other based on screen size)
    expect(screen.getByText('Desktop Label')).toBeInTheDocument();
    expect(screen.getByText('Mobile')).toBeInTheDocument();
    
    // Verify the content is also rendered
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
}); 