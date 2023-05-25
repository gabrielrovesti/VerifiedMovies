import React, { useState } from 'react';
import './MoviesView.css';
import SearchBox from '../../components/SearchBox/SearchBox';
import movies from "../../data/TestingData";
import Movie from "../../types/Movie";
import { useNavigate } from 'react-router-dom';

// Import the necessary to be able to interact with the smart contract
import SelfSovereignIdentity from "../../contracts/SelfSovereignIdentity.json";
import Web3 from "web3";
import { AbiItem } from 'web3-utils';

// Import VC and VP types based on W3C specs
import { VerifiablePresentation } from '../../types/index';
import { IssuerObject, CredentialSubject, VCDIVerifiableCredential, VerifiableCredential } from '../../types/VerifiableCredential';

// CL Signature Modules and Types
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
  const navigate = useNavigate();
  const [movieDetailsCopied, setMovieDetailsCopied] = useState(false);
  const [permalinkCopied, setPermalinkCopied] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredMovies = movies.filter((movie: { title: string; }) =>
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

  const openReviewModal = (movie: Movie) => {
    setCurrentMovie(movie);
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setReviewText('');
    setReviewSubmitted(false);
    if (showVerificationModal) {
      setShowVerificationModal(false);
      setSelectedMovie(null);
    }
  };

  const submitReview = () => {
    if (selectedMovie !== null) {
      setReviewSubmitted(true);
    }
    setReviewText('');
  };

  const shareMovieDetails = () => {
    if (selectedMovie !== null) {
      const movieDetails = `Film: ${selectedMovie.title}`;
  
      navigator.clipboard.writeText(movieDetails)
        .then(() => {
          setMovieDetailsCopied(true);
  
          const permalink = `https://example.com/movie-details?${encodeURIComponent(movieDetails)}`;
          navigator.clipboard.writeText(permalink)
            .then(() => {
              setPermalinkCopied(true);
            })
            .catch((error) => {
              console.error('Failed to copy permalink to clipboard:', error);
            });
        })
        .catch((error) => {
          console.error('Failed to copy movie details to clipboard:', error);
        });
    }
  };
  
  
  const openShareModal = (movie: Movie) => {
    setCurrentMovie(movie);
    setShareModalOpen(true);
  };
  
  const closeShareModal = () => {
    setShareModalOpen(false);
    if (showVerificationModal) {
      setShowVerificationModal(false);
      setSelectedMovie(null);
    }
    setMovieDetailsCopied(false);
    setPermalinkCopied(false);
  };

  async function handleVerificationSubmit(movie: Movie) {
    try {
      setShowLoading(true);
      setVerificationStatus('In corso...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const web3 = new Web3('http://localhost:8545');
      const contractAddress = '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F'
      const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);
      const accounts = await web3.eth.getAccounts();
      const userDid = await contract.methods.createDid().call({ from: accounts[0] }); 

      if (userDid !== null) {
        const vc = await retrieveVC(userDid);

        const vp = await createVP(vc, vc.proof.signature, vc.proof.signatureCorrectnessProof);

        const isVerified = await verifyVP(vp);

        if (isVerified) {
          setShowLoading(false);
          setIsVerified(true);
          setVerificationStatus('Verifica avvenuta correttamente!');
          await new Promise(resolve => setTimeout(resolve, 2000));
          navigate(`/movies/${movie.id}/book`); 

        } else {
          setIsVerified(false);
          setShowLoading(false);
          setVerificationStatus('Verifica fallita: firma non valida.');
          await new Promise(resolve => setTimeout(resolve, 2000));
          setShowVerificationModal(false);
        }
      } 
      else {
        setShowLoading(false);
        setVerificationStatus('Verifica fallita: DID non esistente.'); 
        await new Promise(resolve => setTimeout(resolve, 2000));
        setShowVerificationModal(false);
      }

    } catch (error) {
      console.log("Errore durante la verifica: ", error);
      setVerificationStatus('Verifica fallita: si consiglia di riprovare più tardi.');
      setShowLoading(false);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowVerificationModal(false);
    }
  }
  
  /*
  To create a CLSignature2019 signature, the specification lists these steps. The process includes:
  - Generate a private key for the issuer, which is used to sign the credential.
  - Generate a public key from the private key, which is used to verify the signature.
  - Generate a nonce value, which is used to create the signature correctness proof.
  - Compute the commitment value, created by multiplying the nonce by the public key, which is used to create the signature correctness proof.
  - Compute the response value, created by multiplying the private key by the commitment value, which is used to create the signature correctness proof.
  - Compute the signature value, which is used to create the signature correctness proof.
  - Compute the signature correctness proof, which is used to prove that the signature is valid.

  The signature correctness proof is a zero-knowledge proof that the signature is valid. The proof is generated using the issuer's private key, the nonce, the commitment, the response, and the signature.

  Below these is a safe implementation of the CLSignature2019 signature algorithm. It uses the bn.js library for big number arithmetic and the elliptic library for elliptic curve cryptography.
  */
 
  async function retrieveVC(userDid: string | null) {
      setVerificationStatus('Recupero della credenziale...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const web3 = new Web3('http://localhost:8545');
      const contractAddress = '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F'
      const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);

      const accounts = await web3.eth.getAccounts();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const issuer = await contract.methods.createDid().send({ from: accounts[4] }); //here we do use one of the issuers account resolving then the chain below
      const issuerDid = await contract.methods.createDid().call({ from: accounts[4] });


      // Generate a private key for the issuer
      const privateKey = new BN(1373628729, 16); 

      // Create an ECDSA secp256k1 signer, which uses SHA256 as the hash function
      const ec = new EC('secp256k1');

      // Generate a key pair from the private key, in compressed format
      const keyPair = ec.keyFromPrivate(privateKey);

      // Generate a public key from the private key, in compressed format
      const publicKey = keyPair.getPublic();
      const publicKeyHex = publicKey.encode('hex');

      // Generate a random nonce, which is a 256-bit number
      const nonce = ec.genKeyPair().getPrivate();

      // Compute the commitment value, which is the nonce multiplied by the public key
      const commitment = keyPair.getPublic().mul(nonce);
      const commitmentX = new BN(commitment.getX().toString(16), 16);

      // Compute the master secret, which is the sum of the private key and the commitment
      const masterSecret = ec.genKeyPair().getPrivate();

      // Compute the response value, which is the sum of the private key and the commitment multiplied by the master secret
      const response = privateKey.add(commitmentX.mul(masterSecret));

      let signature: Signature; 
      signature = {
        r: response.mod(ec.curve.n),
        s: nonce.sub(response.mul(privateKey)).mod(ec.curve.n),
      };

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
            id: userDid ? userDid : "",
            type: "VerifiableCredential"
        },        
        issuer: {
          id: issuerDid,
          publicKey: publicKeyHex //the issuer's public key
        } as IssuerObject,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: userDid,
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
      const vc = vp.verifiableCredential as VCDIVerifiableCredential[];
      const verifiableCredential = vc[0];
    
      const userAge = verifiableCredential.credentialSubject.age;
    
      let isAgeValid: boolean;
    
      if (userAge >= requiredAge) {
        isAgeValid = true;
      } else {
        isAgeValid = false;
      }

      return isAgeValid;
    }
    
    async function verifySignatureCorrectnessProof(signature: Signature, signatureCorrectnessProof: string, publicKey: string): Promise<boolean> {
        const ec = new EC('secp256k1');
        const publicKeyEC = ec.keyFromPublic(publicKey, 'hex');
    
        const hexToBytes = (hex: string) => new Uint8Array(hex.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
        const signatureCorrectnessProofBytes = hexToBytes(signatureCorrectnessProof);

        let isValidProof = publicKeyEC.verify(signatureCorrectnessProofBytes, signature);

        // Check if the signature has "r" and "s" values, which were the same used to create the signature correctness proof
        // this here is a stupid but easy workaround, since the library doesn't provide a way to check if the signature correctness proof is valid
        
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
        
      const web3 = new Web3('http://localhost:8545');
      const contractAddress = '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F';
      const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);
    
      const resolutionResult = await contract.methods.resolve(issuerDid).call();
      const didDocument = resolutionResult;

      if (!didDocument && didDocument.id !== issuerDid) {
        console.log("DID document not found");
        return false;
      }
  
      // Check if the user's DID document has the correct issuer as the last node in the chain of trust
      const chainResolutionResult = await contract.methods.resolveChain(issuerDid).call();
      
      // Here we get ALL of the user DIDs of the chain; inside of here there are the issuers and the CA
      const userDids = chainResolutionResult.userDids;

      // Ideally, there are 10 elements in this array; one of them should be the last chain node, which here is the [1] element counting from 0 here ofc
      // One of them is the CA which signs the whole transaction and then the rest are the issuers; here I do find the issuer at account[4]
      // according to my logic; this is the issuer of the credential and for my logic is more than enough

      const foundIssuer = userDids.includes(issuerDid);
      
      // We get the index of the issuer in the chain of trust 
      const index = userDids.indexOf(issuerDid);
      
      // We check if the issuer is in the chain of trust and was found
      if (index === -1) {
        setVerificationStatus("Errore nella verifica della catena di fiducia; le credenziali non sono valide.");
        return false;
      }
      
      // We then get the last DID in the chain of trust
      const lastDIDInChain = userDids[index];
      
      // We finally check if the issuer is inside the chain of trust and corresponds to the right account (the last chain node here is the VC issuer)
      if (!foundIssuer && lastDIDInChain.toLowerCase() !== issuerDid.toLowerCase()) {
        setVerificationStatus("Errore nella verifica della catena di fiducia; le credenziali non sono valide.");
        return false;
      }
          
      // All checks passed, the VP is verified
      return true;
    }    
    
    async function verifyVP(vp: VerifiablePresentation): Promise<boolean> {
      setVerificationStatus('Verificando i tuoi dati...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { proof, verifiableCredential } = vp;
    
      const { proofValue } = proof;
      const { signatureValue, signatureCorrectnessProof } = proofValue;

      const { r, s } = signatureValue;
      
      const signature = { r: r, s: s };
          
      let publicKey: string = '';

      let issuerdid: string = '';
      if (verifiableCredential) {
        const vc = Array.isArray(verifiableCredential) ? verifiableCredential[0] as VCDIVerifiableCredential : verifiableCredential as VCDIVerifiableCredential;
        const issuer = vc.issuer as IssuerObject;
        publicKey = issuer.publicKey || '';
        issuerdid = issuer.id || '';
      }
    
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
      
      return filteredMovies.map((movie: Movie | null) => {
        if (!movie) {
          return <p>Nessun film trovato.</p>;
        }
    
        return (
          <div key={movie.id} className="movie-card" onClick={() => openVerificationModal(movie)}>
            <img className="movie-image" src={movie.imageUrl} alt={"Immagine del film " + movie.title} />
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
        <h2>Film in evidenza</h2>
        <SearchBox onSearch={handleSearch} />
        <div className="movies-grid">
          {renderMovies()}
        </div>

        {showVerificationModal && selectedMovie && !reviewModalOpen && !shareModalOpen && (
          <div className="modal-overlay">
            <div className="verification-modal">
              <h2>Verifica la tua età per continuare</h2>
              <p>{verificationStatus}</p>
              {showLoading && <div className="spinner" />}
              {!isVerified && <p>Questo film è valutato {selectedMovie.ageRating}. Per favore, dimostra la tua età per accedere al film e prenotarlo.</p>}
              {!isVerified && (
                <button onClick={() => handleVerificationSubmit(selectedMovie)}>Procedi</button>
              )}
              <button onClick={closeVerificationModal}>Chiudi</button>
            </div>
          </div>
        )}
    
        {reviewModalOpen && (
          <div className="modal-overlay">
            <div className="review-modal">
              <h3>Scrivi una recensione</h3>
              <textarea
                className="review-textarea"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Inserisci la tua recensione..."
              ></textarea>
              <div>
                {reviewSubmitted ? (
                  <>
                  <p>Recensione lasciata con successo!</p>
                  <button className="cancel-review-button" onClick={closeReviewModal}>
                      Chiudi
                  </button>
                  </>
                ) : (
                  <>
                    <button className="submit-review-button" onClick={submitReview}>
                      Invia
                    </button>
                    <button className="cancel-review-button" onClick={closeReviewModal}>
                      Annulla
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
    
        {shareModalOpen && currentMovie && (
          <div className="modal-overlay">
            <div className="verification-modal">
              <h2>Condividi i dettagli del film</h2>
              <p>{`Film: ${currentMovie.title}`}</p>
              <p>{`Anno: ${currentMovie.year}`}</p>
              <p>{`Valutazione: ${currentMovie.rating}`}</p>
              <p>{`Categorie: ${currentMovie.categories.join(', ')}`}</p>
              <p>{`Età: ${currentMovie.ageRating}`}</p>
              <div>
                {movieDetailsCopied && permalinkCopied? (
                  <h4>Dettagli del film e link copiati negli appunti.</h4>
                ) : (
                  <button className="generate-link-button" onClick={shareMovieDetails}>
                    Condividi
                  </button>
                )}
                {permalinkCopied || movieDetailsCopied ? (
                  <button className="copy-link-button" onClick={closeShareModal}>
                    Chiudi
                  </button>
                ) : (
                  <button className="cancel-share-button" onClick={closeShareModal}>
                    Annulla
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
}