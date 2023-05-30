import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MovieBookingView from './MovieBookingView';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from 'react-router-dom';

describe('MovieBookingView', () => {
    beforeEach(() => {
      localStorage.clear();
    });
  
    it('should render with initial state', () => {
      render(<MemoryRouter><MovieBookingView /></MemoryRouter>);
  
      const movieTitle = screen.getByText('Prenota qui per');
      expect(movieTitle).toBeInTheDocument();
  
      const bookingDateSelect = screen.getByLabelText('Data di prenotazione:') as HTMLSelectElement;
      expect(bookingDateSelect.value).toBe('');
    
      const bookingTimeSelect = screen.getByLabelText('Ora di prenotazione:') as HTMLSelectElement;
      expect(bookingTimeSelect.value).toBe('');
    
      const numTicketsInput = screen.getByLabelText('Numero di biglietti:') as HTMLInputElement;
      expect(numTicketsInput.value).toBe('0');
    
      const reservedSeatsInput = screen.getByLabelText('Posti che vuoi riservare:') as HTMLInputElement;
      expect(reservedSeatsInput.value).toBe('');
    
    });
  
    it('should perform a successful booking', () => {
      const mockNavigate = jest.fn();
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValueOnce('[]'),
        setItem: jest.fn(),
      };
  
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(mockLocalStorage.getItem);
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(mockLocalStorage.setItem);
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate,
      }));
  
      render(<MemoryRouter><MovieBookingView /></MemoryRouter>);
  
      const bookingDateSelect = screen.getByLabelText('Data di prenotazione:');
      fireEvent.change(bookingDateSelect, { target: { value: '25-05' } });
  
      const bookingTimeSelect = screen.getByLabelText('Ora di prenotazione:');
      fireEvent.change(bookingTimeSelect, { target: { value: '10:00' } });
  
      const numTicketsInput = screen.getByLabelText('Numero di biglietti:');
      fireEvent.change(numTicketsInput, { target: { value: '2' } });
  
      const reservedSeatsInput = screen.getByLabelText('Posti che vuoi riservare:');
      fireEvent.change(reservedSeatsInput, { target: { value: 'A1, A2' } });
  
      const submitButton = screen.getByRole('button', { name: 'Prenota' });
      fireEvent.click(submitButton);
  
      expect(screen.getByText('Data: 25-05')).toBeInTheDocument();
      expect(screen.getByText('Orario: 10:00')).toBeInTheDocument();
      expect(screen.getByText('Numero di biglietti: 2')).toBeInTheDocument();
  
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  
    it('should display an error notification for an invalid booking', () => {
      render(<MemoryRouter><MovieBookingView /></MemoryRouter>);
    
      const bookingDateSelect = screen.getByLabelText('Data di prenotazione:');
      fireEvent.change(bookingDateSelect, { target: { value: '28-05' } });
    
      const bookingTimeSelect = screen.getByLabelText('Ora di prenotazione:');
      fireEvent.change(bookingTimeSelect, { target: { value: '20:00' } });
    
      const numTicketsInput = screen.getByLabelText('Numero di biglietti:');
      fireEvent.change(numTicketsInput, { target: { value: '5' } });
    
      const reservedSeatsInput = screen.getByLabelText('Posti che vuoi riservare:');
      fireEvent.change(reservedSeatsInput, { target: { value: 'A1, A2, A3, A4, A5, A6, A7' } });
    
      const submitButton = screen.getByRole('button', { name: 'Prenota' });
      fireEvent.click(submitButton);
    
      const errorNotification = screen.getByText('Prenotazione non disponibile per le opzioni selezionate.');
      expect(errorNotification).toBeInTheDocument();
    });
    
});