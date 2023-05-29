import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { AuthContext } from '../../context/AuthContext';

const MockComponent = () => <div>Mock Component</div>;

describe('PrivateRoute', () => {

  it('redirects to login page when user is not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/private']}>
        <AuthContext.Provider
          value={{
            user: null,
            setUser: jest.fn(),
            isAuthenticated: false,
            logout: jest.fn(),
          }}
        >
          <Routes>
            <Route path="/private" element={<PrivateRoute element={<MockComponent />} />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  });
});
