import React, { useState } from "react";
import "./RegisterView.css";
import { AbiItem } from 'web3-utils';
import Web3 from "web3";
import SelfSovereignIdentity from "../../contracts/SelfSovereignIdentity.json";

export default function RegisterView() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [did, setDid] = useState('');
  const [age, setAge] = useState(0);
  const [randomNumber, setRandomNumber] = useState(0);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [didError, setDidError] = useState("");

  const handleUsernameChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setUsername(event.target.value);
  };

  const handleEmailChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setEmail(event.target.value);
  };

  const handleDateOfBirthChange = (event: { target: { value: string | number | Date; }; }) => {
    setDateOfBirth(event.target.value.toString());
    const age = calculateAge(new Date(event.target.value));
    setAge(age);
  };

  const calculateAge = (birthday: string | number | Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(birthday).getTime();
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return age;
  };

  const handleDidChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setDid(event.target.value);
  };

  const checkEmailExisting = (email: string) => {
    // Check if email already exists in userData stored in localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || 'null');
  
    if (userData && userData.email === email) {
      alert('L\'email fornita esiste già. Per favore, usane un\'altra.');
      return true;
    }
  
    return false;
  };
  
  const checkDidExisting = (did: string) => {
    // Check if DID already exists in userData stored in localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || 'null');
  
    if (userData && userData.did === did) {
      alert('Il DID fornito esiste già. Per favore, usane un altro.');
      return true;
    }
  
    return false;
  };

  const handleVerificationSubmit = async () => {

    const isEmailExisting = checkEmailExisting(email);
    const isDidExisting = checkDidExisting(did);

    if (isEmailExisting) {
      setEmailError("Email already exists");
      return;
    } else {
      setEmailError("");
    }

    if (isDidExisting) {
      setDidError("DID already exists");
      return;
    } else {
      setDidError("");
    }

    // Connessione a Web3 e al contratto
    const web3 = new Web3('http://localhost:8545');
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);

    // Prendo l'account dell'utente
    const accounts = await web3.eth.getAccounts();
    console.log("accounts: " + accounts[0]);
    
    // Firmo il messaggio
    const signature = await web3.eth.sign(randomNumber.toString(), accounts[0]);
    console.log("signature: " + signature);

    // Sending the DID from account X to the contract
    const userDid = await contract.methods.createDid().send({ from: accounts[0] }); 

    // Genero la prova contenente il metodo di verifica, un valore di proof e il proof purpose
    // Link: https://w3c.github.io/vc-data-integrity/#example-a-dataintegrityproof-example-using-a-nist-ecdsa-2022-cryptosuite
    const proof = {
      "@context": "https://www.w3.org/2018/credentials/v1",
      "type": "DataIntegrityProof",
      "created": new Date().toISOString(),
      "proofPurpose": "authentication",
      "verificationMethod": userDid,
      "value": randomNumber.toString(),
      "signatureValue": signature,
    };

    // Recupero il didUrl da verificationMethod e lo uso per verificare la firma associata all'account X
    const didUrl = proof.verificationMethod;
    console.log("didUrl: " + JSON.stringify(didUrl));

    // Chiamo lo smart contract per verifica
    const verification = await contract.methods.getAuthentication("did:ssi-cot-eth:1337:f39fd6e51aad88f6f4ce6ab8827279cfffb92266#key-1").call();
    console.log("verification: " + JSON.stringify(verification));  

    // Controllo con recover di Web3 se corrispondono il numero di prima, come signature il proof (non prefissato di suo)
    // Link: https://web3js.readthedocs.io/en/v1.9.0/web3-eth-accounts.html#recover

    const recovered = await web3.eth.accounts.recover(randomNumber.toString(), proof.signatureValue);
    console.log("recovered: " + recovered);

    // Se corrisponde il controllo tra "recover" e l'account che ha inizializzato la verifica, allora è verificato
    
    if (recovered === verification[5]) {
    const userData = { username,email,dateOfBirth,did,age};
        localStorage.setItem('userData', JSON.stringify(userData));
        setShowVerificationModal(false);
        alert('Registrazione avvenuta con successo!');
    } else {
        alert('La verifica non è andata a buon fine, si prega di riprovare.');
    }
};

const handleVerificationClose = () => {
    setShowVerificationModal(false);
};

const handleSubmit = (event: { preventDefault: () => void; }) => {
  event.preventDefault();

  // Validate required fields
  if (!username || !email || !dateOfBirth || !did) {
    alert("Please fill in all the required fields");
    return;
  }

  // Calculate user age
  const age = calculateAge(dateOfBirth);
  setAge(age);

  // Generate random number for verification
  const randomNumber = Math.floor(Math.random() * 1000000) + 1;
  setRandomNumber(randomNumber);

  setUsername("");
  setEmail("");
  setDateOfBirth("");
  setDid("");
  setEmailError("");
  setDidError("");

  // Show verification modal
  setShowVerificationModal(true);
};

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h2>Inserisci qui i tuoi dati</h2>
        <div className="form-group">
          <label htmlFor="firstName">Username</label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            value={username}
            onChange={handleUsernameChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Indirizzo email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
          {emailError && <span className="error-message">{emailError}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth">Data di nascita</label>
          <input
            type="date"
            className="form-control"
            id="dateOfBirth"
            value={dateOfBirth}
            onChange={handleDateOfBirthChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="did">DID</label>
          <input
            type="text"
            className="form-control"
            id="did"
            value={did}
            onChange={handleDidChange}
            required
          />
          {didError && <span className="error-message">{didError}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-register">
          Registrati
        </button>
      </form>
      {showVerificationModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Dimostra che sei tu. </h2>
            <p>Questo è il tuo numero:</p>
            <h1>{randomNumber}</h1>
            <div className="modal-buttons">
              <button onClick={handleVerificationSubmit}>Verifica</button>
              <button onClick={handleVerificationClose}>Chiudi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}