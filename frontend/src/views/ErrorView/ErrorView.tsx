import "./ErrorView.css";

export default function ErrorView() {

  return (
     <div className="index">
        <div className="text">
        <h3>Oh no, pagina non trovata!</h3>
        <p>
            La pagina che cercavi purtroppo non esiste. Torna alla <a href="/">pagina principale</a>.
        </p>
        </div>
      </div>
  );
};
