import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import ErrorView from './ErrorView';

describe('ErrorView', () => {
    test('renders the error message and link', () => {
      render(
        <MemoryRouter>
          <ErrorView />
        </MemoryRouter>
      );
  
      const errorMessage = screen.getByText('Oh no, pagina non trovata!');
      const link = screen.getByText('pagina principale');
  
      expect(errorMessage).toBeInTheDocument();
      expect(link).toBeInTheDocument();
      expect(link.getAttribute('href')).toBe('/');
    });
});