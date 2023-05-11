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
import { VerifiablePresentation } from '../../types/index';

import SelfSovereignIdentity from "../../contracts/SelfSovereignIdentity.json";
import Web3 from "web3";
import { AbiItem } from 'web3-utils';
import { IssuerObject, LinkedDataObject, VCDIVerifiableCredential, VerifiableCredential } from '../../types/VerifiableCredential';

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
      // Connessione a Web3 e al contratto
      const web3 = new Web3('http://localhost:8545');
      const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
      const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress); //TODO - chiamare il contratto per verificare la catena di credenziali
      console.log("contract: " + contract); //useless, but to not have warning now

      // Prendo l'account dell'utente
      const accounts = await web3.eth.getAccounts();
      console.log("accounts: " + accounts[0]);
        
      // recupero il DID dell'utente
      const userDID = await getUserDID();

      if (userDID !== null) {
      // recupero la VC dell'utente
      const vc = await retrieveVC(userDID);
      
      // creo la VP con l'età e il DID dell'utente, che è l'holder della VC
      const vp = await createVP([vc], userDID);

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
      } else {
        console.log('User DID is null');
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
      
      const vc: VCDIVerifiableCredential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'http://localhost:3000/credentials/1',
        type: ['VerifiableCredential', 'AgeCredential'],
          credentialSchema: {
            id: "did:example:cdf:35LB7w9ueWbagPL94T9bMLtyXDj9pX5o",
            type: "did:example:schema:22KpkXgecryx9k7N6XN1QoN3gXwBkSU8SfyyYQG",
          },        
        issuer: {
          id: 'did:example:456', //TODO - sostituire con il DID del server di identità
        } as IssuerObject,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
        id: userDID,
        age: 25,
        type: 'VerifiableCredential',
        } as LinkedDataObject,
        proof: {
          type: "CLSignature2019",
          issuerData: "did:example:456",
          attributes: "age",
          signature: "", //TODO - aggiungere la firma
          signatureCorrectnessProof: "", //TODO - aggiungere la correttezza sulla firma
        },
      };
      return vc;
    }
  
    async function createVP(vcs: VerifiableCredential[], holder: string): Promise<VerifiablePresentation> {
      // Create an array of `credentials` objects with each VC and its nested `proof` object according to the W3C type
      const credentials = vcs.map(vc => {
        return {
          '@context': [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
          ],
          type: ["VerifiableCredential"],
          credentialSchema: {
            id: "did:example:cdf:35LB7w9ueWbagPL94T9bMLtyXDj9pX5o",
            type: "did:example:schema:22KpkXgecryx9k7N6XN1QoN3gXwBkSU8SfyyYQG"
          },
          issuer: "did:example:Wz4eUg7SetGfaUVCn8U9d62oDYrUJLuUtcy619",
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            type: 'VerifiableCredential',
          },
          proof: {
            type: "AnonCredDerivedCredentialv1",
            primaryProof: "cg7wLNSi48K5qNyAVMwdYqVHSMv1Ur8i...Fg2ZvWF6zGvcSAsym2sgSk737",
            nonRevocationProof: "mu6fg24MfJPU1HvSXsf3ybzKARib4WxG...RSce53M6UwQCxYshCuS3d2h"
          }
        };
      });
    
      // Create the Verifiable Presentation object with the nested array of credentials and the top-level proof object
      const vp: VerifiablePresentation = {
        '@context': [
          "https://www.w3.org/2018/credentials/v1",
          "https://www.w3.org/2018/credentials/examples/v1"
        ],
        type: "VerifiablePresentation",
        verifiableCredential: credentials,
        proof: {
          "type": "AnonCredPresentationProofv1",
          "proofValue": "DgYdYMUYHURJLD7xdnWRinqWCEY5u5fK...j915Lt3hMzLHoPiPQ9sSVfRrs1D"
        }
      };

      // Sign the `presentation` object and set the `proofValue`
      const proofValue = await signPresentation(vp);
      vp.proof.proofValue = proofValue;
      
      // Return the signed `presentation` object
      return vp;
    }

    
    // Function to sign the presentation object
    async function signPresentation(presentation: any): Promise<string> {
      
      // Create an array of `credentialProofs` objects with each VC's proof value
      const credentialProofs = presentation.verifiableCredential.map((vc: { proof: { primaryProof: any; nonRevocationProof: any; }; }) => {
        return {
          primaryProof: vc.proof.primaryProof,
          nonRevocationProof: vc.proof.nonRevocationProof
        }
      })
      
      // Sign the `credentailProofs` object
      const credentialProofsSignature = await signCredentialProofs(credentialProofs)
      
      // Create the `presentationProof` object
      const presentationProof = {
        type: 'AnonCredPresentationProofv1',
        credentialProofs: credentialProofs,
        proofValue: credentialProofsSignature
      }
      
      // Sign the `presentationProof` object
      const proofValue = await signData(presentationProof)
      
      // Return the proof value
      return proofValue
    }
    
    // Function to sign credential proofs
    async function signCredentialProofs(credentialProofs: any): Promise<string> {
      // Replace this with your own implementation of signing credential proofs
      // For example, if you are using a CL signature scheme, you can use the `signCredentialProofs` function from the `cl-signatures` library
      const signatureValue = await signCredentialProofs(credentialProofs)
      return signatureValue
    }
    
    // Function to sign data with a private key
    async function signData(data: any): Promise<string> {
      // Replace this with your own implementation of signing data with a private key
      // For example, if you are using an EdDSA signature scheme, you can use the `signData` function from the `ed25519-signatures` library
      const privateKey = await getPrivateKey()
      const signatureValue = await signData(privateKey)
      return signatureValue
    }
    
    // Function to get the private key
    async function getPrivateKey(): Promise<any> {
      // Replace this with your own implementation of getting the private key
      const privateKey = "";
      return privateKey
    }
    
  
    async function verifyVP(vp: VerifiablePresentation): Promise<boolean> {
      // TODO - We have to properly write it; for now, just to pass type checks

      if (vp.holder === null) {
        return false;
      }
      return true;
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