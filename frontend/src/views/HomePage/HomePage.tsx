import { useEffect } from "react";
import "./HomePage.css";
import CreateDID from "../../utils/CreateDID";
import CreateIssuers from "../../utils/CreateIssuers";

export default function HomePage() {
  useEffect(() => {
    async function createAndStoreDID() {
      const userDID = await CreateDID();
      console.log(userDID);
    }
    createAndStoreDID();
    CreateIssuers();
  }, []);

  return (
     <div className="index">
        <div className="hero">
        <h1>Un cinema all'avanguardia</h1>
        <p>
          Scopri un'ampia selezione di film e spettacoli imperdibili e acquista i biglietti in modo sicuro,  basato su blockchain.
        </p>
        </div>
        <div className="social-proof">
          <div className="testimonial">
            <p>"Ho apprezzato molto l'ampia selezione di film disponibili. Grazie al nostro sistema di verifica dell'identità, mi sento al sicuro durante la prenotazione e l'acquisto dei biglietti!"</p>
            <p className="author">- Maria R.</p>
          </div>
          <div className="testimonial">
            <p>"Sono rimasto colpito dalla sicurezza dei dati offerta dal nostro sistema di verifica. Mi sento tranquillo mentre acquisto i biglietti e guardo gli spettacoli."</p>
            <p className="author">- Luca M.</p>
          </div>
        </div>
      </div>
  );
};
