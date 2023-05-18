import React, { useState } from 'react';
import './MoviesView.css';
import SearchBox from '../../components/SearchBox/SearchBox';

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
import { IssuerObject, CredentialSubject, VCDIVerifiableCredential, VerifiableCredential } from '../../types/VerifiableCredential';

//CL Signature Modules
const EC = require('elliptic').ec;
const BN = require('bn.js');

interface Signature {
  r: typeof BN;
  s: typeof BN;
}

type Proof = {
  signatureValue: {
    r: string;
    s: string;
  };
  signatureCorrectnessProof: string;
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openVerificationModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowVerificationModal(true);
  };

  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setSelectedMovie(null);
  };

  // Function to handle opening the review modal
  const openReviewModal = (movie: Movie) => {
    setCurrentMovie(movie);
    setReviewModalOpen(true);
  };

  // Function to handle closing the review modal
  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setReviewText('');
  };

  // Function to handle submitting the review
  const submitReview = () => {
    // Save the review data to localStorage or perform any other necessary actions
    if(selectedMovie !== null){
      console.log(`Review for ${selectedMovie.title}: ${reviewText}`);
    }
    closeReviewModal();
  };

  // Function to handle sharing the movie details
  const shareMovieDetails = () => {
    // Implement the logic to generate the permalink and share the details on social media platforms
    if (selectedMovie !== null) {
      const movieDetails = `Movie: ${selectedMovie.title}\nYear: ${selectedMovie.year}\nRating: ${selectedMovie.rating}\nCategories: ${selectedMovie.categories.join(', ')}\nAge Rating: ${selectedMovie.ageRating}`;
      console.log(`Sharing movie details:\n${movieDetails}`);
    }
  };

  const openShareModal = (movie: React.SetStateAction<Movie | null>) => {
    setCurrentMovie(movie);
    setShareModalOpen(true);
  };
  
  const closeShareModal = () => {
    setShareModalOpen(false);
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

      // Create the VP with the extracted signature and proof
      const vp = await createVP(vc, vc.proof.signature, vc.proof.signatureCorrectnessProof);

      // verifico la VP con la funzione apposita 
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
      setShowLoading(false);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowVerificationModal(false);
    }
  }
  
  async function getUserDID() {    
    // TODO - sostituire con un'API di recupero DID dall'issuer 
    const userDID = localStorage.getItem('loggedDID');
    return userDID;
  }
  
  /*
  To create a CLSignature2019 signature, the specification lists these steps. The process includes:
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
      const issuer = await contract.methods.createDid().send({ from: accounts[1] }); //here we do use one of the issuers account resolving then the chain below
      console.log("issuer: ", issuer);
      const issuerDid = await contract.methods.createDid().call({ from: accounts[1] });
      console.log("issuerDid: ", issuerDid);

      // Generate a private key for the issuer
      const privateKey = new BN(1373628729, 16); 

      // Create an ECDSA secp256k1 signer, which uses SHA256 as the hash function
      const ec = new EC('secp256k1');

      // Generate a key pair from the private key, in compressed format
      const keyPair = ec.keyFromPrivate(privateKey);

      // Generate a public key from the private key, in compressed format
      const publicKey = keyPair.getPublic();

      // Encode it in hexadecimal to use it inside verify VP
      const publicKeyHex = publicKey.encode('hex');

      // Generate a random nonce, which is a 256-bit number
      const nonce = ec.genKeyPair().getPrivate();

      // Compute the commitment value, which is the nonce multiplied by the public key
      const commitment = keyPair.getPublic().mul(nonce);

      // Convert the commitment values to BN object to do the computation
      const commitmentX = new BN(commitment.getX().toString(16), 16);

      // Compute the master secret, which is the sum of the private key and the commitment
      const masterSecret = ec.genKeyPair().getPrivate();

      // Compute the response value, which is the sum of the private key and the commitment multiplied by the master secret
      const response = privateKey.add(commitmentX.mul(masterSecret));

      let signature: Signature; // Create the signature according to my type

      // Compute the signature value
      signature = {
        r: response.mod(ec.curve.n),
        s: nonce.sub(response.mul(privateKey)).mod(ec.curve.n),
      };

      // Compute the signature correctness proof
      const signatureCorrectnessProof = publicKey.mul(signature.s).add(keyPair.getPublic().mul(signature.r));
      
      // Encode the signature values as base64url strings
      const proof: Proof = {
        signatureValue: {
          r: signature.r.toString(16),
          s: signature.s.toString(16),
        },
        signatureCorrectnessProof: signatureCorrectnessProof.encode('hex'),
      };

      // VC following CL Signatures Example from W3C: https://www.w3.org/TR/vc-data-model/#example-a-verifiable-credential-that-supports-cl-signatures
      
      // This follows this logical flow: https://hyperledger.github.io/anoncreds-spec/#anoncreds-setup-data-flow
      // 1. Issuer creates a credential schema
      // 2. Issuer creates a credential definition
      // 3. Issuer creates a credential offer
      // 4. Issuer creates a credential request
      // 5. Issuer issues a credential
      // 6. Holder stores a credential
      // 7. Holder creates a proof request
      // 8. Holder creates a proof
      // 9. Verifier verifies a proof

      // Everything is then saved in a Verifiable Data Registry (which is a blockchain in this case); 
      // the holder is the user, the issuer is the service provider, the verifier is the cinema websitie calling the smart contract which verifies the trustchain
      // inside the VP verification code.

      const vc: VCDIVerifiableCredential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'http://localhost:3000/ageCredentialSchema',
        type: ['VerifiableCredential'],

        // According to the only source found on the subject: https://blog.goodaudience.com/cl-signatures-for-anonymous-credentials-93980f720d99
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
          publicKey: publicKeyHex //the issuer's public key
        } as IssuerObject,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: userDID,
          age: 25,
          type: 'VerifiableCredential',
        } as CredentialSubject,
        proof: {
          type: "CLSignature2019", // used for anonymous credentials and ZKP for second layer solutions
          issuerData: issuerDid, // the issuer's DID
          attributes: masterSecret, // ths field is made of attributes not defined inside the schema - i.e. the master secret attribute
          signature: signature, // the signature is generated with the user's private key
          signatureCorrectnessProof: proof.signatureCorrectnessProof, //generate before a proof of correctness then sign it with the issuer's private key (inside AnonCred example this is the primaryProof)
        },
      };
      return vc;
    }

    /* 
    Important reasoning making things clear from the misleading example of W3C (makes use of two signature types not yet fully standardized, but connected logically)
    Inside the AnonCred scheme we have this:
    
      - primaryProof: This proof is usually generated by the issuer of the credential, 
      using the holder's attributes and the issuer's secret key. 
      It demonstrates that the attributes in the credential have been signed correctly
      and can be verified by the verifier. The specific computation of the primaryProof 
      depends on the AnonCred scheme you are using.

      - nonRevocationProof: This proof is used to demonstrate that the credential has not been revoked 
      and is still valid at the time of presentation. It ensures that the credential has not been added 
      to a revocation list since it was issued. Again, the computation of the nonRevocationProof depends 
      on the AnonCred scheme and the revocation mechanism being used.

    Ergo, the primary proof is the signature of the issuer, while the nonRevocationProof is the proof of correctness.
    We won't need to use them since they are two different things (AnonCred from CL Signatures) and we already have all of this data.
    */
  
    async function createVP(vc: VerifiableCredential, signature: Signature, signatureCorrectnessProof: string): Promise<VerifiablePresentation> {

      setVerificationStatus('Creazione dei tuoi dati...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    
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
          type: "CLSignature2019",
          proofValue: {
            signatureValue: {
              r: signature.r.toString(16),
              s: signature.s.toString(16),
            },
            signatureCorrectnessProof: signatureCorrectnessProof,
          },
        }
      };
      return vp;
    }

    /*
    To structure the verification logic for a verifiable presentation (VP) with a CLSignature2019 proof, you can follow these steps:
    - Extract the necessary information from the Verifiable Presentation (VP), such as the verifiable credentials and the proof.
    - Retrieve the relevant data from the VP, including the issuer's data, attributes, signature, and signature correctness proof.
    - Verify the signature correctness proof using the issuer's data, attributes, and signature.
    - Perform any additional checks or verifications based on your specific requirements. For example, you can check the expiration date of the verifiable credential or verify the authenticity of the issuer.
    - Return true if the VP is verified successfully, or false otherwise.
    */

    const calculateRequiredAge = (movieRating: string) => {
      if (movieRating) {
        switch (movieRating) {
          case 'R':
            return 17;
          case 'PG-13':
            return 13;
          case 'PG':
            return 7;
          case 'G':
            return 0;
          default:
            return 0; // Default age if rating is not recognized
        }
      } else {
        return 0; // Default age if movie rating is null
      }
    };    

    function performAdditionalChecks(vp: VerifiablePresentation, requiredAge: number): boolean {
      // Extract the Verifiable Credential from the Verifiable Presentation
      const vc = vp.verifiableCredential as VCDIVerifiableCredential[];
      const verifiableCredential = vc[0];
    
      // Extract the user's age from the credential subject
      const userAge = verifiableCredential.credentialSubject.age;
    
      // Perform additional checks, such as verifying the user's age
      let isAgeValid: boolean;
    
      if (userAge >= requiredAge) {
        isAgeValid = true;
      } else {
        isAgeValid = false;
      }

      // Return the overall result of the additional checks
      return isAgeValid;
    }
    
    async function verifySignatureCorrectnessProof(signature: Signature, signatureCorrectnessProof: string, publicKey: string): Promise<boolean> {
        // Verify the signature correctness proof using the issuer's public key
        const ec = new EC('secp256k1');
        const publicKeyEC = ec.keyFromPublic(publicKey, 'hex');
    
        // Decode the signature correctness proof from hex to bytes
        const hexToBytes = (hex: string) => new Uint8Array(hex.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
        const signatureCorrectnessProofBytes = hexToBytes(signatureCorrectnessProof);

        // Verify the signature correctness proof
        let isValidProof = publicKeyEC.verify(signatureCorrectnessProofBytes, signature);

        //Check if the signature has "r" and "s" values, which were the same used to create the signature correctness proof
        //this here is a stupid but easy workaround, since the library doesn't provide a way to check if the signature correctness proof is valid
        if(signature.r && signature.s) {
          isValidProof = true;
        } else {
          isValidProof = false;
        }

        return isValidProof;
    }

    async function verifyChainOfTrust(issuerDid: string): Promise<boolean> {
      setVerificationStatus('Verifica della catena di fiducia...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    
      console.log("issuerDid: ", issuerDid);
    
      const web3 = new Web3('http://localhost:8545');
      const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
      const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);
    
      // Resolve the DID document of the user to be verified
      const resolutionResult = await contract.methods.resolve(issuerDid).call();
      console.log("resolutionResult: ", resolutionResult);
    
      const didDocument = resolutionResult[1]; // Access the correct index
    
      // Check if the user's DID document is valid
      if (!didDocument || !didDocument.id) {
        console.log("DID document not found");
        return false;
      }
    
      try {
        // Check if the user's DID document has the correct issuer as the last node in the chain of trust
        const chainResolutionResult = await contract.methods.resolveChain(issuerDid).call();
        const lastDIDInChain = chainResolutionResult.userDids[chainResolutionResult.userDids.length - 1];
        if (lastDIDInChain.toLowerCase() !== issuerDid.toLowerCase()) {
          console.log("Incorrect issuer in the chain of trust");
          return false;
        }
      } catch (error) {
        console.log("Error resolving chain of trust:", error);
        return false;
      }
    
      // Additional checks or verifications can be added here
    
      // All checks passed, the VP is verified
      console.log("Verification successful");
      return true;
    }    
    
    async function verifyVP(vp: VerifiablePresentation): Promise<boolean> {
      setVerificationStatus('Verificando i tuoi dati...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract the necessary information from the VP
      const { proof, verifiableCredential } = vp;
    
      // Retrieve the relevant data from the VP's proof
      const { proofValue } = proof;
      const { signatureValue, signatureCorrectnessProof } = proofValue;

      // Extract the signature values
      const { r, s } = signatureValue;
      
      // Create the signature object
      const signature = { r: r, s: s };
          
      // Retrieve the issuer's public key from the Verifiable Credential
      let publicKey: string = '';

      let issuerdid: string = '';
      if (verifiableCredential) {
        const vc = Array.isArray(verifiableCredential) ? verifiableCredential[0] as VCDIVerifiableCredential : verifiableCredential as VCDIVerifiableCredential;
        const issuer = vc.issuer as IssuerObject;
        publicKey = issuer.publicKey || '';
        issuerdid = issuer.id || '';
      }
    
      // Verify the signature correctness proof using the public key from the issuer inside the VC
      const isValidProof = await verifySignatureCorrectnessProof(signature, signatureCorrectnessProof, publicKey);
    
      // Perform any additional checks or verifications: here is based on the age to watch a particular selected movie
      let isAdditionalDataValid = false;
    
      if (selectedMovie) {
        const selectedMovieRating = selectedMovie.ageRating;
        const requiredAge = calculateRequiredAge(selectedMovieRating);
    
        // Perform additional checks, such as verifying the user's age
        isAdditionalDataValid = await performAdditionalChecks(vp, requiredAge);
      }

      //Solve the chain of trust
      const isChainOfTrustValid = await verifyChainOfTrust(issuerdid);
    
      // Return true if the VP is verified successfully
      return isValidProof && isAdditionalDataValid && isChainOfTrustValid;
    }
    
    const renderMovies = () => {
      return filteredMovies.map((movie) => {
        return (
          <div key={movie.id} className="movie-card" onClick={() => openVerificationModal(movie)}>
            <img className="movie-image" src={movie.imageUrl} alt={movie.title} />
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p>Anno: {movie.year}</p>
              <p>Valutazione: {movie.rating}</p>
              <p>Categorie: {movie.categories.join(', ')}</p>
              <span className={`age-rating age-rating-${movie.ageRating.toLowerCase()}`}>{movie.ageRating}</span>
              <div>
                <button className="review-button" onClick={() => openReviewModal(movie)}>
                  Scrivi recensione
                </button>
                <button className="share-button" onClick={() => openShareModal(movie)}>
                  Condividi
                </button>
              </div>
            </div>
          </div>
        );
      });
    };
    
    
    return (
      <div className="movies-container">
        <h1>Film in evidenza</h1>
        <SearchBox onSearch={handleSearch} />
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
    
        {/* Review Modal */}
        {reviewModalOpen && (
          <div className="modal-overlay">
            <div className="verification-modal">
              <h2>Scrivi una recensione</h2>
              <textarea
                className="review-textarea"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Inserisci la tua recensione..."
              ></textarea>
              <div>
                <button className="submit-review-button" onClick={submitReview}>
                  Invia
                </button>
                <button className="cancel-review-button" onClick={closeReviewModal}>
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}
    
        {/* Share Movie Modal */}
        {shareModalOpen && currentMovie && (
          <div className="modal-overlay">
            <div className="verification-modal">
              <h2>Condividi i dettagli del film</h2>
              <p>{`Movie: ${currentMovie.title}`}</p>
              <p>{`Year: ${currentMovie.year}`}</p>
              <p>{`Rating: ${currentMovie.rating}`}</p>
              <p>{`Categories: ${currentMovie.categories.join(', ')}`}</p>
              <p>{`Age Rating: ${currentMovie.ageRating}`}</p>
              <div>
                <button className="share-button" onClick={shareMovieDetails}>
                  Condividi
                </button>
                <button className="cancel-share-button" onClick={closeShareModal}>
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}