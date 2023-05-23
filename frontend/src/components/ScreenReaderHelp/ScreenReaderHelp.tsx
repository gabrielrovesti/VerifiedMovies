import React from 'react';
import './ScreenReaderHelp.css';

const ScreenReaderHelp = () => {
  return (
    <div className="screen-reader-help sr-only">
        <h2>Aiuto per gli screen reader</h2>
        <p>Questo componente è stato inserito per aiutare gli screen reader a capire il contenuto della pagina.</p>
    </div>
  );
};

export default ScreenReaderHelp;
