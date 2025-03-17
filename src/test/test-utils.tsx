import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

type PDFRenderProps = {
  loading: boolean;
  error: boolean;
};

// Mock for PDFDownloadLink since it doesn't work well in test environment
vi.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: ({ children }: { children: (props: PDFRenderProps) => React.ReactNode }) => 
    children({ loading: false, error: false }),
  Document: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StyleSheet: {
    create: () => ({}),
  },
  Font: {
    register: () => {},
  },
}));

// Mock for Supabase authentication
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'test-user-id' },
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Custom render function that includes providers if needed
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render }; 