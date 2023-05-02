import React from "react";
import "./Index.css";

export default function Index() {
  return (
    <div className="index">
      <div className="hero">
        <h1>Film, serie e tanto altro sotto il pieno controllo </h1>
        <p>
          Goditi un'esperienza di streaming video sicura e privata, di alta qualità e con verificata basata su blockchain.
        </p>
      </div>
      <div className="social-proof">
        <h2>Cosa dicono i nostri utenti</h2>
        <div className="testimonial">
          <p>"Ho apprezzato molto l'ampia selezione di film per tutta la famiglia. Grazie VerifiedMovies!"</p>
          <p className="author">- Maria R.</p>
        </div>
        <div className="testimonial">
          <p>"Sono rimasto colpito dalla sicurezza dei dati offerta da VerifiedMovies. Mi sento al sicuro mentre guardo i film."</p>
          <p className="author">- Luca M.</p>
        </div>
      </div>
    </div>
  );
};
