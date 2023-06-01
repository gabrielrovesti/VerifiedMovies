import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import RegisterView from './RegisterView';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

test('displays error notification if any field is missing', () => {
    render(
        <MemoryRouter>
            <RegisterView />
        </MemoryRouter>
    );

    const registerButton = screen.getByText('Registrati');

    fireEvent.click(registerButton);

    const errorNotification = screen.getByText('Per favore, inserisci tutti i campi.');
    expect(errorNotification).toBeInTheDocument();
});

test('displays success notification after successful registration', () => {
    render(
        <MemoryRouter>
            <RegisterView />
        </MemoryRouter>
    );  

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Indirizzo email');
    const dateOfBirthInput = screen.getByLabelText('Data di nascita');
    const didInput = screen.getByLabelText('DID');
    const registerButton = screen.getByText('Registrati');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(dateOfBirthInput, { target: { value: '1990-01-01' } });
    fireEvent.change(didInput, { target: { value: 'did:example:123' } });
    fireEvent.click(registerButton);

    const verifyButton = screen.getByText('Verifica');
    fireEvent.click(verifyButton);

});

test('displays error notification if email or DID already exist', () => {
    const userData = { email: 'existing@example.com', did: 'did:example:existing' };
    sessionStorage.setItem('userData', JSON.stringify(userData));

    render(
        <MemoryRouter>
            <RegisterView />
        </MemoryRouter>
    );  

    const emailInput = screen.getByLabelText('Indirizzo email');
    const didInput = screen.getByLabelText('DID');
    const registerButton = screen.getByText('Registrati');

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(didInput, { target: { value: 'did:example:existing' } });
    fireEvent.click(registerButton);

    sessionStorage.removeItem('userData');
});
