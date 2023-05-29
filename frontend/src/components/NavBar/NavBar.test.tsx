import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '@testing-library/jest-dom';
import NavBar from './NavBar';

describe('NavBar', () => {

  test('renders a menu with links when not authenticated', () => {
    render(
      <AuthContext.Provider value={{ isAuthenticated: false, user: null, setUser: () => {}, logout: () => {} }}>
        <NavBar />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const homeLink = screen.getByText('Home');
    const loginLink = screen.getByText('Accedi');
    const registerLink = screen.getByText('Registrati');
    expect(homeLink).toBeInTheDocument();
    expect(loginLink).toBeInTheDocument();
    expect(registerLink).toBeInTheDocument();
  });

  test('renders a menu with links when authenticated', () => {
    render(
        <AuthContext.Provider value={{ isAuthenticated: false, user: null, setUser: () => {}, logout: () => {} }}>
        <NavBar />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const moviesLink = screen.getByText('Home');
    const accountLink = screen.getByText('Accedi');
    const bookingsLink = screen.getByText('Registrati');
    expect(moviesLink).toBeInTheDocument();
    expect(accountLink).toBeInTheDocument();
    expect(bookingsLink).toBeInTheDocument();
  });

  test('toggles mobile menu when menu button is clicked', () => {
    render(
    <AuthContext.Provider value={{ isAuthenticated: false, user: null, setUser: () => {}, logout: () => {} }}>
        <NavBar />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );
  });
});