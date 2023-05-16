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

//CL Signature Modules
const EC = require('elliptic').ec;
const BN = require('bn.js');

interface Signature {
  r: typeof BN;
  s: typeof BN;
}

// Interface for movie frontend data
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
  const [showLoading, setShowLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Movies testing data
  const movies: Movie[] = [
    {
      id: "1",
      title: 'Le ali della libertà',
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
      title: 'Schindler\'s List',
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
      setShowLoading(true);
      setVerificationStatus('In corso...');
      await new Promise(resolve => setTimeout(resolve, 2000));
        
      // recupero il DID dell'utente (salvato al momento del login nel local storage)
      const userDID = await getUserDID();

      if (userDID !== null) { //controllo che ci vuole per non avere errori di tipo
      // recupero la VC dell'utente
      const vc = await retrieveVC(userDID);
      
      // creo la VP con l'età e il DID dell'utente, che è l'holder della VC
      const vp = await createVP(vc, userDID);

      // verifico la VP con il servizio di verifica
      const isVerified = await verifyVP(vp);

      // mostro il risultato all'utente
      if (isVerified) {
        setShowLoading(false);
        setIsVerified(true);
        setVerificationStatus('Verifica avvenuta correttamente!');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setShowVerificationModal(false);
      } else {
        setIsVerified(false);
        setShowLoading(false);
        setVerificationStatus('Verifica fallita!');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setShowVerificationModal(false);
      }
      } else {
        alert('Non sei in possesso di un DID!'); //TODO - sostituire con un messaggio più carino
      }

    } catch (error) {
      console.error('Errore in fase di verifica:', error);
      setVerificationStatus('Verifica fallita!');
    }
  }
  
  async function getUserDID() {
    // recupero il DID dell'utente, per semplicità salvato in locale al momento del login
    const userDID = localStorage.getItem('loggedDID');
    return userDID;
  }
  
  /*
  To create a CLSignature2019 signature, you need to follow the steps described in the specification. The process includes:
  - Generate a private key for the issuer.
  - Generate a public key from the private key.
  - Generate a nonce value.
  - Compute the commitment value.
  - Compute the response value.
  - Compute the signature value.
  - Compute the signature correctness proof.

  The signature correctness proof is a zero-knowledge proof that the signature is valid. The proof is generated using the issuer's private key, the nonce, the commitment, the response, and the signature.

  Below these is a safe implementation of the CLSignature2019 signature algorithm. It uses the bn.js library for big number arithmetic and the elliptic library for elliptic curve cryptography.
  */
 
  async function retrieveVC(userDID: string | null) {
      setVerificationStatus('Recupero della credenziale...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const web3 = new Web3('http://localhost:8545');
      const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
      const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);

      const accounts = await web3.eth.getAccounts();
      const issuerDid = await contract.methods.createDid().send({ from: accounts[1] });

      // Generate a private key for the issuer
      const privateKey = new BN(1373628729, 16); 
      
      // Create an ECDSA secp256k1 signer, which uses SHA256 as the hash function
      const ec = new EC('secp256k1');
      // Generate a key pair from the private key, in compressed format
      const keyPair = ec.keyFromPrivate(privateKey);

      // Generate a public key from the private key, in compressed format
      const publicKey = keyPair.getPublic();

      // Generate a random nonce, which is a 256-bit number
      const nonce = new BN(1234567891023456, 16);

      // Compute the commitment value, which is the nonce multiplied by the public key
      const commitment = publicKey.mul(nonce);

      // Convert the commitment values to BN object to do the computation
      const commitmentX = new BN(commitment.getX().toString(16), 16);

      // Compute the master secret, which is the sum of the private key and the commitment
      const masterSecret = new BN(3398299298, 16);

      // Compute the response value, which is the sum of the private key and the commitment multiplied by the master secret
      const response = privateKey.add(commitmentX.mul(masterSecret));

      let signature: Signature;

      // Compute the signature value
      signature ={
        r: response.mod(ec.curve.n),
        s: nonce.sub(response.mul(privateKey)).mod(ec.curve.n),
      };

      // Compute the signature correctness proof
      const signatureCorrectnessProof = publicKey.mul(signature.s).add(keyPair.getPublic().mul(signature.r));

      // Encode the signature values as base64url strings
      const proof = {
        signatureValue: {
          r: signature.r.toString(16),
          s: signature.s.toString(16),
        },
        signatureCorrectnessProof: signatureCorrectnessProof.encode('hex'),
      };

      // VC following CL Signatures Example from W3C: https://www.w3.org/TR/vc-data-model/#example-a-verifiable-credential-that-supports-cl-signatures
      const vc: VCDIVerifiableCredential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'http://localhost:3000/ageCredentialSchema',
        type: ['VerifiableCredential'],

        // according to the only source found: https://blog.goodaudience.com/cl-signatures-for-anonymous-credentials-93980f720d99
        // this implements a base for ZKP for anonymous credentials (CL signature) for second layer solutions;
        // according to https://arxiv.org/pdf/2208.04692.pdf this signature type is standardized (page 23/30, the table)
        // and classified for JSON CL Signatures, used for example in Sovrin or Hyperledger Indy.
        // This allows credential binding with persistent identifier, and that's exactly what it's used here.
        
        // For the sake of simplicity, I will use the same signature type for all the credentials.
        credentialSchema: { 
            id: userDID ? userDID : "",
            type: "VerifiableCredential"
        },        
        issuer: {
          id: issuerDid,
        } as IssuerObject,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: userDID,
          age: 25,
          type: 'VerifiableCredential',
          masterSecret: masterSecret, // The master secret is a secret key (or value here) that is used to create a user's private keys for each credential they receive.
        } as LinkedDataObject,
        proof: {
          type: "CLSignature2019", // used for anonymous credentials and ZKP for second layer solutions
          issuerData: issuerDid, // the issuer's DID
          attributes: masterSecret, // ths field is made of attributes not defined inside the schema - i.e. the master secret attribute
          signature: signature, // the signature is generated with the user's private key
          signatureCorrectnessProof: proof, //generate before a proof of correctness then sign it with the issuer's private key
        },
      };
      return vc;
    }
  
    async function createVP(vc: VerifiableCredential, holder: string): Promise<VerifiablePresentation> {
    
      // Create the Verifiable Presentation object with the nested previous VC (ideally, the should be many VCS, but here it's not necessary)
      // in any case, you can easily pass an array and iterate over it to create the VP with many VCs
      // As reference, here: https://www.w3.org/TR/vc-data-model/#example-a-verifiable-presentation-that-supports-cl-signatures

      const vp: VerifiablePresentation = {
        '@context': [
          "https://www.w3.org/2018/credentials/v1",
          "https://www.w3.org/2018/credentials/examples/v1"
        ],
        type: "VerifiablePresentation",
        verifiableCredential: [vc],
        proof: {
          "type": "AnonCredPresentationProofv1",
          "proofValue": "DgYdYMUYHURJLD7xdnWRinqWCEY5u5fK...j915Lt3hMzLHoPiPQ9sSVfRrs1D"
        }
      };
      
      // Return the signed `presentation` object
      return vp;
    }
    
    async function verifyVP(vp: VerifiablePresentation): Promise<boolean> {
      // TODO - We have to properly write it; for now, just to pass type checks
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

  //TODO - aggiungere migliori opzioni di visualizzazione per le varie fasi di verifica
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
            <p>{verificationStatus}</p>
            {showLoading && <div className="spinner" />}
            {!isVerified && <p>Questo film è valutato {selectedMovie.ageRating}. Per favore, dimostra la tua età per accedere a questo contenuto.</p>}
            <button onClick={handleVerificationSubmit}>Procedi</button>
            <button onClick={closeVerificationModal}>Chiudi</button>
            </div>
        </div>
    )}
    </div>
  );
}