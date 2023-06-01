import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import MoviesView from './MoviesView';
import { useAuth } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

jest.mock('../../context/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('MoviesView', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: jest.fn(),
      isAuthenticated: false,
      logout: jest.fn(),
    });
  });

  test('renders the page', () => {
    render(
      <MemoryRouter>
        <MoviesView />
      </MemoryRouter>
    );
    expect(screen.getByText('Film in evidenza')).toBeInTheDocument();
  });

  test('opens a movie and age verification dialog when clicked', () => {
    render(
      <MemoryRouter>
        <MoviesView />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Il Padrino - Parte II'));

    expect(screen.getByText('Anno: 1974')).toBeInTheDocument();
    expect(screen.getByText('Categorie: Drammatico, Gangster')).toBeInTheDocument();

    expect(screen.getByText('Verifica la tua età per continuare')).toBeInTheDocument();
    expect(screen.getByText('Procedi')).toBeInTheDocument();
  });

  test('allows sharing a movie and opens the share dialog', () => {
    render(
      <MemoryRouter>
        <MoviesView />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Le ali della libertà'));

    const shareButtons = screen.getAllByText(/Condividi/); 

    shareButtons.forEach((button) => {
        fireEvent.click(button);
    });
  });

  test('renders a message when no movies are available', () => {
    render(
      <MemoryRouter>
        <MoviesView />
      </MemoryRouter>
    );

    const movies = screen.queryAllByTestId('movie-item');
    expect(movies.length).toBe(0);
  });

  test('shows the user profile if authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { did: 'existingdid' },
      setUser: jest.fn(),
      isAuthenticated: true,
      logout: jest.fn(),
    });

    render(
      <MemoryRouter>
        <MoviesView />
      </MemoryRouter>
    );

  });

  test("triggers age verification is valid", () => {
    mockUseAuth.mockReturnValue({
      user: { did: 'existingdid' },
      setUser: jest.fn(),
      isAuthenticated: true,
      logout: jest.fn(),
    });

    render(
      <MemoryRouter>
        <MoviesView />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Il Padrino - Parte II'));
    expect(screen.getByText('Anno: 1974')).toBeInTheDocument();
    expect(screen.getByText('Categorie: Drammatico, Gangster')).toBeInTheDocument();
    expect(screen.getByText('Verifica la tua età per continuare')).toBeInTheDocument();
    
    expect(screen.getByText('Procedi')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Procedi'));
    expect(screen.getByText('In corso...')).toBeInTheDocument();
  });

});
