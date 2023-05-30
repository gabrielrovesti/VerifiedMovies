import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import AccountView from './AccountView';

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { did: 'userDid' },
    setUser: jest.fn(),
  })),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockDeactivate = jest.fn().mockResolvedValue({ send: jest.fn() }) as jest.Mock;

jest.mock('web3', () => {
  return jest.fn().mockImplementation(() => {
    return {
      eth: {
        Contract: jest.fn().mockReturnValue({
          methods: {
            deactivate: mockDeactivate,
          },
        }),
        getAccounts: jest.fn().mockResolvedValue(['account1']),
      },
    };
  });
});

describe('AccountView', () => {
  test('renders the account form and handles profile update', () => {

    render(
      <MemoryRouter>
        <AuthProvider>
          <AccountView />
        </AuthProvider>
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const dateOfBirthInput = screen.getByLabelText('Data di nascita');
    const updateProfileButton = screen.getByText('Aggiorna profilo');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(dateOfBirthInput, { target: { value: '1990-01-01' } });
    fireEvent.click(updateProfileButton);

    expect(useAuth().setUser).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      dateOfBirth: '1990-01-01',
      did: 'userDid',
    });

    expect(screen.getByText('Dati modificati con successo!')).toBeInTheDocument();
  });

  test('renders the account form and handles account deletion', async () => {
 
    render(
      <MemoryRouter>
        <AuthProvider>
          <AccountView />
        </AuthProvider>
      </MemoryRouter>
    );

    const deleteAccountButton = screen.getByText('Cancella account');
    fireEvent.click(deleteAccountButton);

    expect(mockDeactivate).toHaveBeenCalled();
    expect(useAuth().setUser).toHaveBeenCalledWith(null);
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('userData');
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('loggedIn');
    expect(screen.getByText('Il tuo account è stato cancellato con successo!')).toBeInTheDocument();
    expect(useNavigate()).toHaveBeenCalledWith('/');
  });
});
