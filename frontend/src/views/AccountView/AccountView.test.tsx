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

const deactivateMock = jest.fn().mockReturnValue({ send: jest.fn() });

jest.mock('web3', () => {
  return jest.fn().mockImplementation(() => {
    return {
      eth: {
        Contract: jest.fn().mockReturnValue({
          methods: {
            deactivate: deactivateMock,
          },
        }),
        getAccounts: jest.fn().mockResolvedValue(['account1']),
      },
    };
  });
});

describe('AccountView', () => {
  test.skip('renders the account form and handles profile update', () => {

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

    // Assert that the setUser function is called with the updated user data
    expect(useAuth().setUser).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      dateOfBirth: '1990-01-01',
      did: 'userDid',
    });

    // Assert that a success message is shown to the user
    expect(window.alert).toHaveBeenCalledWith('Dati modificati con successo!');
  });

  test.skip('renders the account form and handles account deletion', () => {
    // Mocking Web3 and contract
 
     render(
       <MemoryRouter>
         <AuthProvider>
           <AccountView />
         </AuthProvider>
       </MemoryRouter>
    );

    const deleteAccountButton = screen.getByText('Cancella account');
    fireEvent.click(deleteAccountButton);

    // Assert that the contract's deactivate method is called
    // Assert that the contract's deactivate method is called
    expect(deactivateMock).toHaveBeenCalled();

    // Assert that the setUser function is called with null to clear the user data
    expect(useAuth().setUser).toHaveBeenCalledWith(null);

    // Assert that a success message is shown to the user
    expect(window.alert).toHaveBeenCalledWith('Il tuo account è stato cancellato con successo!');

    // Assert that the user is redirected to the login page
    expect(useNavigate()).toHaveBeenCalledWith('/login');
  });
});