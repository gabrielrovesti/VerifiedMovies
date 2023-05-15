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

//CL Signature
const EC = require('elliptic').ec;
const BN = require('bn.js');

interface Signature {
  r: typeof BN;
  s: typeof BN;
}


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
      const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress); 
      console.log("contract: " + contract); //useless, but to not have warning now

      // Prendo l'account dell'utente (per test, sempre il primo)
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
  
  /*
  To create a CLSignature2019 signature, you need to follow the steps described in the specification. The process includes:
    Generate a private key for the issuer.
    Generate a public key from the private key.
    Generate a nonce value.
    Compute the commitment value.
    Compute the response value.
    Compute the signature value.
    Compute the signature correctness proof.

  The signature correctness proof is a zero-knowledge proof that the signature is valid. The proof is generated using the issuer's private key, the nonce, the commitment, the response, and the signature.
  */
 
  
  async function retrieveVC(userDID: string | null) {
      console.log('Retrieving Verifiable Credential...');

      // Simulate a delay of 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      const web3 = new Web3('http://localhost:8545');
      const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
      const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);

      const accounts = await web3.eth.getAccounts();
      const issuerDid = await contract.methods.createDid().send({ from: accounts[1] });

      // Generate a private key for the issuer
      const privateKey = new BN('59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', 16); //taken from test accounts
      const ec = new EC('secp256k1');
      const keyPair = ec.keyFromPrivate(privateKey);
      console.log('keyPair: ' + keyPair)

      // Generate a public key from the private key
      const publicKey = keyPair.getPublic();
      console.log('publicKey: ' + publicKey)

      // Generate a random nonce
      const nonce = new BN('12345678901234567890123456789012', 16); //replace with a random value

      // Compute the commitment value
      const commitment = publicKey.mul(nonce);
      console.log('commitment: ' + commitment)

      // Compute the response value
      const masterSecret = new BN('123456789', 10); //replace with the user's master secret attribute value
      const response = keyPair.priv.add(commitment.mul(masterSecret));
      console.log('response: ' + response)

      let signature: Signature;

      // Compute the signature value
      signature ={
        r: response.mod(ec.curve.n),
        s: nonce.sub(response.mul(privateKey)).mod(ec.curve.n),
      };
      console.log('signature: ' + signature)

      // Compute the signature correctness proof
      const signatureCorrectnessProof = publicKey.mul(signature.s).add(keyPair.getPublic().mul(signature.r));
      console.log('signatureCorrectnessProof: ' + signatureCorrectnessProof)

      // Encode the signature values as base64url strings
      const proof = {
        signatureValue: {
          r: signature.r.toString(16),
          s: signature.s.toString(16),
        },
        signatureCorrectnessProof: signatureCorrectnessProof.encode('hex'),
      };
      console.log('proof: ' + proof)

      const vc: VCDIVerifiableCredential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'http://localhost:3000/ageCredentialSchema',
        type: ['VerifiableCredential'],
        // according to the only source found: https://blog.goodaudience.com/cl-signatures-for-anonymous-credentials-93980f720d99
        // this implements a base for ZKP for anonymous credentials (CL signature) for second layer solutions;
        // according to https://arxiv.org/pdf/2208.04692.pdf this signature type it is standardized (page 23-30, the table)
        // and classified for JSON CL Signatures, used for example in Sovrin or Hyperledger Indy.
        // This allows credential binding with persistent identifier, and that's exactly what I have to use here
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
          issuerData: issuerDid,
          attributes: masterSecret, // ths field is made of attributes not defined inside the schema - i.e. the master secret attribute
          signature: signature, // the signature is generated with the user's private key
          signatureCorrectnessProof: proof, //generate before a proof of correctness then sign it with the issuer's private key
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
            id: holder, // the user presenting the VP is the holder of the VC
            type: "did:example:schema:22KpkXgecryx9k7N6XN1QoN3gXwBkSU8SfyyYQG"
          },
          issuer: "did:example:Wz4eUg7SetGfaUVCn8U9d62oDYrUJLuUtcy619",
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            type: 'VerifiableCredential',
          },
          proof: {
            type: "AnonCredDerivedCredentialv1",
            //TODO - capire come generarsi le proof (DIY FFS)
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