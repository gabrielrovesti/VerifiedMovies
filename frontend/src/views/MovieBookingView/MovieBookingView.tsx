import React, { useState } from "react";
import { useParams } from "react-router-dom";
import movies from '../../data/TestingData';
import { useNavigate } from "react-router-dom";
import "./MovieBookingView.css";

export default function MovieBookingView() {
  const { id } = useParams();
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [numTickets, setNumTickets] = useState(0);
  const [reservedSeats, setReservedSeats] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const navigate = useNavigate();

  const movie = movies.find((movie) => movie.id === id);

  const handleBooking = (e: { preventDefault: () => void; }) => {
    try{
      e.preventDefault();
  
      const movieTitle = movie?.title;
      const isBookingAllowed = validateBooking(bookingDate, bookingTime, numTickets, reservedSeats);
      
      if (isBookingAllowed) {
        const existingBookings = JSON.parse(localStorage.getItem("bookingData") || "[]");
        const newBooking = { bookingDate, bookingTime, numTickets, reservedSeats, movieTitle };
        const updatedBookings = [...existingBookings, newBooking];
        localStorage.setItem("bookingData", JSON.stringify(updatedBookings));
        setBookingConfirmed(true);
      } else {
        alert("Prenotazione non disponibile per le opzioni selezionate.");
      }
    }
    catch(error){
      console.log(error);
    }
  };
  
  const closeModal = () => {
    setBookingConfirmed(false);
  };

  const viewAllBookings = () => {
    navigate('/bookings');
  };

  const validateBooking = (date: string, time: string, tickets: number, seats: string) => {
    const allowedDates = ["25-05", "26-05", "27-05"];
    const allowedTimes = ["10:00", "14:00", "18:00"];
    const maxSeats = 50;

    const isDateAllowed = allowedDates.includes(date);
    const isTimeAllowed = allowedTimes.includes(time);
    const isSeatsAllowed = seats.split(",").length <= maxSeats;

    return isDateAllowed && isTimeAllowed && isSeatsAllowed;
  };

  const allowedDates = ["25-05", "26-05", "27-05"];
  const allowedTimes = ["10:00", "14:00", "18:00"];

  return (
    <div className="movie-container">
      <h2>
        Prenota qui per
        <p></p>
        <span className="movie-title">"{movie?.title}"</span>
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
            <select
              className="form-control"
              id="bookingDate"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            >
              <option value="">Seleziona una data</option>
              {allowedDates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bookingTime">Ora di prenotazione:</label>
            <select
              className="form-control"
              id="bookingTime"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
            >
              <option value="">Seleziona un'ora</option>
              {allowedTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
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
              type="number"
              id="reservedSeats"
              value={reservedSeats}
              onChange={(e) => setReservedSeats(e.target.value)}
            />
          </div>

          <button className="btn-movie-primary btn-movie-register" type="submit">
            Prenota
          </button>
        </form>
      )}
    </div>
  );
}
