import React, { useState } from 'react';
import './MoviesView.css';

// Import images for movies
import firstImage from './movies/first.png';
import secondImage from './movies/second.png';
import thirdImage from './movies/third.png';
import fourthImage from './movies/fourth.png';
import fifthImage from './movies/fifth.png';
import sixthImage from './movies/sixth.png';

//Import VC and VP types
import { VerifiablePresentation, VerifiableCredential } from '../../types/index';


interface Movie {
  id: string;
  title: string;
  year: string;
  rating: string;
  categories: string[];
  ageRating: string;
  imageUrl: string;
}

// Age rating reference for controls:
// https://en.wikipedia.org/wiki/Motion_Picture_Association_film_rating_system
// R = Restricted, PG-13 = Parental Guidance Suggested, PG = Parental Guidance Suggested, G = General Audiences, NR = Not Rated, UR = Unrated, NC-17 = No One 17 and Under Admitted

export default function MoviesView() {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const movies: Movie[] = [
    {
      id: "1",
      title: 'Le ali della libertò',
      year: "1994",
      rating: "9.3",
      categories: ['Drama'],
      ageRating: 'R',
      imageUrl: firstImage,
    },
    {
      id: "2",
      title: 'Il Padrino',
      year: "1972",
      rating: "9.2",
      categories: ['Noir', 'Drammatico', 'Gangster'],
      ageRating: 'R',
      imageUrl: secondImage,
    },
    {
      id: "3",
      title: 'Il Padrino - Parte II',
      year: "1974",
      rating: "9.0",
      categories: ['Drammatico', 'Gangster'],
      ageRating: 'R',
      imageUrl: thirdImage,
    },
    {
      id: "4",
      title: 'Il cavaliere oscuro',
      year: "2008",
      rating: "9.0",
      categories: ['Azione', 'Thriller', 'Drammatico'],
      ageRating: 'PG-13',
      imageUrl: fourthImage,
    },
    {
      id: "5",
      title: 'La parola ai giurati',
      year: "1957",
      rating: "8.9",
      categories: ['Drammatico'],
      ageRating: 'NR',
      imageUrl: fifthImage,
    },
    {
      id: "6",
      title: 'Schindler\'s List - La lista di Schindler',
      year: "1993",
      rating: "8.9",
      categories: ['Biografico', 'Drammatico', 'Storico'],
      ageRating: 'R',
      imageUrl: sixthImage,
    },
  ];

  const openVerificationModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowVerificationModal(true);
  };

  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setSelectedMovie(null);
  };

  async function handleVerificationSubmit() {
    try {
      // recupero il DID dell'utente
      const userDID = await getUserDID();
  
      // recupero la VC dell'utente
      const vc = await retrieveVC(userDID);
  
      // creo la VP con l'età e il DID dell'utente
      const vp = await createVP(vc);
  
      // verifico la VP con il servizio di verifica
      const isVerified = await verifyVP(vp);
  
      // mostro il risultato all'utente
      if (isVerified) {
        console.log('Verifica avvenuta con successo!');
        setShowVerificationModal(false);
        // TODO - aggiungere opzioni di visualizzazioni per l'utente che ha passato la verifica
      } else {
        alert('Verification failed!');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      alert('An error occurred during verification');
    }
  }
  
  async function getUserDID() {
    // recupero il DID dell'utente, ad esempio da un cookie o da un token di autenticazione
    const userDID = localStorage.getItem('userDID');
    return userDID;
  }
  
  async function retrieveVC(userDID: string | null) {
    // recupero la VC dell'utente dal suo DID, ad esempio da un server di identità
    const vc = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'AgeCredential'],
      issuer: 'did:example:456',
      issuanceDate: '2023-05-10T12:00:00Z',
      credentialSubject: {
        id: userDID,
        age: 25
      },
      proof: {
        type: 'Ed25519Signature2018',
        created: '2023-05-10T12:00:00Z',
        verificationMethod: 'did:example:456#key-1',
        signatureValue: '...'
      }
    };
    return vc;
  }
  
  async function createVP(vc: { '@context': string[]; type: string[]; issuer: string; issuanceDate: string; credentialSubject: { id: any; age: number; }; proof: { type: string; created: string; verificationMethod: string; signatureValue: string; }; }) {
    // creo la VP con l'età e il DID dell'utente
    const vp = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [vc],
      proof: {
        type: 'Ed25519Signature2018',
        created: '2023-05-10T12:00:00Z',
        verificationMethod: 'did:example:123#key-1',
        proofPurpose: 'authentication',
        challenge: '...',
        domain: 'example.com',
        presentationSubmission: {}
      }
    };
    return vp;
  }
  
  async function verifyVP(vp: { '@context': string[]; type: string[]; verifiableCredential: any[]; proof: { type: string; created: string; verificationMethod: string; proofPurpose: string; challenge: string; domain: string; presentationSubmission: {}; }; }) {
    // verifico la VP con il servizio di verifica, ad esempio usando una libreria come jsonld-signatures
    const isVerified = true; 
    return isVerified;
  }
  

  const renderMovies = () => {
    return movies.map((movie) => {
      return (
        <div key={movie.id} className="movie-card" onClick={() => openVerificationModal(movie)}>
          <img className="movie-image" src={movie.imageUrl} alt={movie.title} />
          <div className="movie-info">
            <h3>{movie.title}</h3>
            <p>Anno: {movie.year}</p>
            <p>Valutazione: {movie.rating}</p>
            <p>Categorie: {movie.categories.join(', ')}</p>
            <span className={`age-rating age-rating-${movie.ageRating.toLowerCase()}`}>{movie.ageRating}</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="movies-container">
        <h1>Film in evidenza</h1>
      <div className="movies-grid">
        {renderMovies()}
      </div>
      {showVerificationModal && selectedMovie && (
        <div className="modal-overlay">
            <div className="verification-modal">
            <h2>Verifica la tua età</h2>
            <p>Questo film è valutato {selectedMovie.ageRating}. Per favore, dimostra la tua età per accedere a questo contenuto</p>
            <button onClick={handleVerificationSubmit}>Verifica</button>
            <button onClick={closeVerificationModal}>Chiudi</button>
            </div>
        </div>
    )}
    </div>
  );
}