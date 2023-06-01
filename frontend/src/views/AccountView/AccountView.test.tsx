import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import AccountView from './AccountView';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../context/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

beforeEach(() => {
  return mockUseAuth.mockReturnValue({
    user: {
      did: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    },
    setUser: jest.fn(),
    isAuthenticated: false,
    logout: jest.fn(),
  });
});

test('renders AccountView', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AccountView />
        </AuthProvider>
      </MemoryRouter>
    );
});

test('renders AccountView with user data', () => {
    mockUseAuth.mockReturnValueOnce({
      user: {
        did: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      },
      setUser: jest.fn(),
      isAuthenticated: true,
      logout: jest.fn(),
    });
  
    render(
      <MemoryRouter>
        <AuthProvider>
          <AccountView />
        </AuthProvider>
      </MemoryRouter>
    );
});


