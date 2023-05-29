import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { AuthProvider } from '../../context/AuthContext';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

describe('PrivateRoute', () => {
  test('renders children when user is authenticated', () => {
    const mockChildren = <div>Children Component</div>;

    render(
      <MemoryRouter>
        <AuthProvider>
          <PrivateRoute redirectTo="/login">{mockChildren}</PrivateRoute>
        </AuthProvider>
      </MemoryRouter>
    );

  });  
});
