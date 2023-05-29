import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { AuthProvider, useAuth, AuthContext } from './AuthContext';

// Mock user data
const mockUser = { did: '1234567890' };

// Define a test component that uses the useAuth hook
const TestComponent = () => {
  const { user, isAuthenticated, setUser, logout } = useAuth();

  return (
    <div>
      <div data-testid="user">{user ? user.did : 'No user'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <button onClick={() => setUser(mockUser)}>Set User</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// Wrap the test component with the AuthProvider
const renderWithAuthProvider = (children: string | number | boolean | JSX.Element | React.ReactFragment | null | undefined) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ isAuthenticated: false, user: null, setUser: () => {}, logout: () => {} }}>
        <AuthProvider>{children}</AuthProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

// Test the AuthProvider component
describe('AuthProvider', () => {
  test('renders children', () => {
    renderWithAuthProvider(<div>Children Component</div>);

    expect(screen.getByText('Children Component')).toBeInTheDocument();
  });

  test('sets user and updates isAuthenticated', () => {
    renderWithAuthProvider(<TestComponent />);

    fireEvent.click(screen.getByText('Set User'));

    expect(screen.getByTestId('user')).toHaveTextContent(mockUser.did);
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
  });

  test('logs out user and updates isAuthenticated', () => {
    renderWithAuthProvider(<TestComponent />);

    fireEvent.click(screen.getByText('Logout'));

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
  });
});
