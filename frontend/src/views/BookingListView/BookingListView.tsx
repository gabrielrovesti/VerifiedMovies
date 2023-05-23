import React from "react";
import "./BookingListView.css";

export default function BookingListView() {
  const bookingData = JSON.parse(localStorage.getItem("bookingData") || "[]");

  return (
    <div className="booking-container full-height">
      <div className="booking-list-container">
        <h2>Tutte le prenotazioni</h2>

        {bookingData.length > 0 ? (
          bookingData.map((booking: { movieTitle: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; bookingDate: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; bookingTime: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; numTickets: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; reservedSeats: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
            <div key={index} className="booking-details">
              <h3>Film: {booking.movieTitle}</h3>
              <p>Data: {booking.bookingDate}</p>
              <p>Orario: {booking.bookingTime}</p>
              <p>Numero di biglietti: {booking.numTickets}</p>
              <p>Posti riservati: {booking.reservedSeats}</p>
            </div>
          ))
        ) : (
          <p>Nessuna prenotazione effettuata</p>
        )}
      </div>
    </div>
  );
}
