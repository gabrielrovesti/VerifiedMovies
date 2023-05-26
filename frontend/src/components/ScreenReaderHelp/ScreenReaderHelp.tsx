import React from 'react';
import './ScreenReaderHelp.css';

const ScreenReaderHelp = () => {
  return (
    <div className="screen-reader-help">
      <h2>
        <span className="sr-only">Aiuto per gli screen reader</span>
      </h2>
      <p>
        <span className="sr-only">
          Questo componente è stato inserito per aiutare gli screen reader a capire il contenuto della pagina.
        </span>
      </p>
    </div>
  );
};

export default ScreenReaderHelp;
