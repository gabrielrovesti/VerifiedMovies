import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from './SearchBox';

describe('SearchBox', () => {
    it('calls the onSearch function with the entered query', () => {
      const mockOnSearch = jest.fn();
      render(
        <SearchBox onSearch={mockOnSearch} />
      );
  
      const searchInput = screen.getByLabelText('Search');
      fireEvent.change(searchInput, { target: { value: 'example' } });
  
      const searchButton = screen.getByText('Cerca');
      fireEvent.click(searchButton);
  
      expect(mockOnSearch).toHaveBeenCalledWith('example');
    });
  });