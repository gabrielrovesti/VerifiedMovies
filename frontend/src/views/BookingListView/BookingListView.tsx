import React from "react";

export default function BookingListView() {
  const bookingData = JSON.parse(localStorage.getItem("bookingData") || "");

  return (
    <div className="register-container full-height">
      <div className="booking-list-container">
        <h2>Tutte le prenotazioni</h2>

        {bookingData ? (
          <div className="booking-details centered-text">
            <h3>Film: {bookingData.movieTitle}</h3>
            <p>Data: {bookingData.bookingDate}</p>
            <p>Orario: {bookingData.bookingTime}</p>
            <p>Numero di biglietti: {bookingData.numTickets}</p>
            <p>Posti riservati: {bookingData.reservedSeats}</p>
          </div>
        ) : (
          <p>Nessuna prenotazione effettuata</p>
        )}
      </div>
    </div>
  );
}
