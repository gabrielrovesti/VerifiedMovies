import React, { useState } from "react";
import { useParams } from "react-router-dom";
import movies from '../../data/TestingData';
import { useNavigate } from "react-router-dom";

export default function MovieBookingView() {
  const { id } = useParams();
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [numTickets, setNumTickets] = useState(0);
  const [reservedSeats, setReservedSeats] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const navigate = useNavigate();

  // Find the movie based on the ID
  const movie = movies.find((movie) => movie.id === id);

  const handleBooking = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    const movieTitle = movie?.title;

    // Save the booking data to localStorage for later use and for simplicity as of now
    const bookingData = { bookingDate, bookingTime, numTickets, reservedSeats, movieTitle };
    const existingBookings = JSON.parse(localStorage.getItem("bookingData") || "[]");
    const updatedBookings = [...existingBookings, bookingData];
    localStorage.setItem('bookingData', JSON.stringify(updatedBookings));

    setBookingConfirmed(true);
  };

  const closeModal = () => {
    setBookingConfirmed(false);
  };

  const viewAllBookings = () => {
    navigate('/bookings');
  };

  return (
    <div className="register-container">
      <h2>
        Prenota qui per
        <p></p>
        "<span className="movie-title">{movie?.title}</span>"
      </h2>

      {bookingConfirmed ? (
        <div className="modal">
          <div className="modal-content">
            <h2>Prenotazione avvenuta con successo!</h2>
            <h4>Riepilogo della prenotazione</h4>
            <p>Data: {bookingDate}</p>
            <p>Orario: {bookingTime}</p>
            <p>Numero di biglietti: {numTickets}</p>
            <p>Posti riservati: {reservedSeats}</p>
            
            <button className="btn-primary" onClick={closeModal}>Chiudi</button>
            {bookingConfirmed && (
                <button className="btn-primary" onClick={viewAllBookings}>
                Tutte le prenotazioni
                </button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleBooking}>
          <div className="form-group">
            <label htmlFor="bookingDate">Data di prenotazione:</label>
            <input
              className="form-control"
              type="date"
              id="bookingDate"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bookingTime">Ora di prenotazione:</label>
            <input
              className="form-control"
              type="time"
              id="bookingTime"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="numTickets">Numero di biglietti:</label>
            <input
              className="form-control"
              type="number"
              id="numTickets"
              value={numTickets}
              onChange={(e) => setNumTickets(parseInt(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reservedSeats">Posti che vuoi riservare:</label>
            <input
              className="form-control"
              type="text"
              id="reservedSeats"
              value={reservedSeats}
              onChange={(e) => setReservedSeats(e.target.value)}
            />
          </div>

          <button className="btn-primary btn-register" type="submit">
            Prenota
          </button>
        </form>
      )}
    </div>
  );
}
