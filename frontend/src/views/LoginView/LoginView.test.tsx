import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import LoginView from './LoginView';
import { useAuth } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

jest.mock('../../context/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginView', () => {
  test('renders login form', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: jest.fn(),
      isAuthenticated: false,
      logout: jest.fn(),
    });

    render(
        <MemoryRouter>
            <LoginView />
        </MemoryRouter>
    );

    const didInput = screen.getByLabelText('DID');
    expect(didInput).toBeInTheDocument();

    const loginButton = screen.getByRole('button', { name: 'Accedi' });
    expect(loginButton).toBeInTheDocument();
  });

  test('displays error notification for non-existing DID', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: jest.fn(),
      isAuthenticated: false,
      logout: jest.fn(),
    });

    render(
        <MemoryRouter>
            <LoginView />
        </MemoryRouter>
    );

    const didInput = screen.getByLabelText('DID');
    const loginButton = screen.getByRole('button', { name: 'Accedi' });

    fireEvent.change(didInput, { target: { value: 'nonexistingdid' } });
    fireEvent.click(loginButton);

    const errorNotification = screen.getByText(
      'Il DID inserito non è esistente. Per favore, registrati prima di effettuare il login.'
    );
    expect(errorNotification).toBeInTheDocument();
  });

  test('opens verification modal for existing DID', () => {
    mockUseAuth.mockReturnValue({
      user: { did: 'existingdid' },
      setUser: jest.fn(),
      isAuthenticated: false,
      logout: jest.fn(),
    });

    render(
        <MemoryRouter>
            <LoginView />
        </MemoryRouter>
    );

    const didInput = screen.getByLabelText('DID');
    const loginButton = screen.getByRole('button', { name: 'Accedi' });

    fireEvent.change(didInput, { target: { value: 'existingdid' } });
    fireEvent.click(loginButton);

    const verificationModal = screen.getByText('Accedi');
    expect(verificationModal).toBeInTheDocument();
  });
});
