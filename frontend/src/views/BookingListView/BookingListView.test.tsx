import React from 'react';
import { render, screen } from '@testing-library/react';
import BookingListView from './BookingListView';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

describe('BookingListView', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render with no bookings', () => {
    render(<BookingListView />);

    const noBookingMessage = screen.getByText('Nessuna prenotazione effettuata');
    expect(noBookingMessage).toBeInTheDocument();
  });

  it('should render with bookings', () => {
    const mockBookingData = [
      {
        movieTitle: 'Movie 1',
        bookingDate: '2023-05-30',
        bookingTime: '18:00',
        numTickets: 2,
        reservedSeats: 'A1, A2',
      },
      {
        movieTitle: 'Movie 2',
        bookingDate: '2023-06-01',
        bookingTime: '20:30',
        numTickets: 1,
        reservedSeats: 'B5',
      },
    ];

    localStorage.setItem('bookingData', JSON.stringify(mockBookingData));

    render(<BookingListView />);

    const bookingDetails = screen.getAllByTestId('booking-details');

    expect(bookingDetails).toHaveLength(2);

    expect(screen.getByText('Film: Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Data: 2023-05-30')).toBeInTheDocument();
    expect(screen.getByText('Orario: 18:00')).toBeInTheDocument();
    expect(screen.getByText('Numero di biglietti: 2')).toBeInTheDocument();
    expect(screen.getByText('Posti riservati: A1, A2')).toBeInTheDocument();

    expect(screen.getByText('Film: Movie 2')).toBeInTheDocument();
    expect(screen.getByText('Data: 2023-06-01')).toBeInTheDocument();
    expect(screen.getByText('Orario: 20:30')).toBeInTheDocument();
    expect(screen.getByText('Numero di biglietti: 1')).toBeInTheDocument();
    expect(screen.getByText('Posti riservati: B5')).toBeInTheDocument();
  });
});
