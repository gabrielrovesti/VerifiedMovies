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
     <main className="index">
        <header className="hero">
        <h1>Il cinema del futuro</h1>
        <p>
          Scopri un'ampia selezione di film e spettacoli imperdibili e acquista i biglietti in modo sicuro con l'uso di <span lang="en">blockchain</span>.
        </p>
        </header>
        <section className="social-proof">
          <div className="testimonial" aria-labelledby="testimonial1">
            <p id="testimonial1">Grazie a <span lang="en">VerifiedMovies</span>, posso godermi una vasta selezione di film. La tecnologia <span lang="en">blockchain</span> e la sicurezza del sistema garantiscono la mia <span lang="en">privacy</span> in un modo così semplice; non me l'aspettavo!"</p>
            <p className="author">- Maria R.</p>
          </div>
          <div className="testimonial" aria-labelledby="testimonial2">
            <p id="testimonial2">"<span lang="en">VerifiedMovies</span> offre un livello di sicurezza eccezionale grazie alla verifica delle informazioni tramite la <span lang="en">blockchain</span>. Posso acquistare i biglietti in tutta tranquillità, in modo semplice e protetto davvero."</p>
            <p className="author">- Luca M.</p>
          </div>
        </section>
      </main>
  );
};
