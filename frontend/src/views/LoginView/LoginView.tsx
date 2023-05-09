import React, { useState } from "react";
import "./LoginView.css";
import SelfSovereignIdentity from "../../contracts/SelfSovereignIdentity.json";
import Web3 from "web3";
import { AbiItem } from 'web3-utils';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginView() {

  const [did, setDid] = useState(localStorage.getItem('userDID') || '');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [randomNumber, setRandomNumber] = useState(0);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    // Generate random number for verification
    const randomNumber = Math.floor(Math.random() * 1000000) + 1;
    setRandomNumber(randomNumber);
    setDid("");

    // Show verification modal
    setShowVerificationModal(true);
  };

  const handleVerificationSubmit = async () => {

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
  
    // Crea un nuovo DID per l'utente nel caso non lo abbia già (se lo ha, lo recupera dal local storage, caso mio)
    const userDid = await contract.methods.createDid().call({ from: accounts[0] }); 
    console.log("userDid: " + userDid);
  
    // Genero la prova contenente il metodo di verifica, un valore di proof e il proof purpose
    // Link: https://w3c.github.io/vc-data-integrity/#example-a-dataintegrityproof-example-using-a-nist-ecdsa-2022-cryptosuite
    const proof = {
      "@context": "https://www.w3.org/2018/credentials/v1",
      "type": "DataIntegrityProof",
      "created": new Date().toISOString(),
      "proofPurpose": "authentication",
      "verificationMethod": localStorage.getItem('userDID') === '' ? localStorage.getItem('userDID') : userDid,
      "value": randomNumber.toString(),
      "signatureValue": signature,
    };
  
    // Recupero il didUrl da verificationMethod e lo uso per verificare la firma associata all'account X
    const didUrl = proof.verificationMethod;
    console.log("didUrl: " + didUrl);
  
    //Chiamo lo smart contract per verifica
    const verification = await contract.methods.getAuthentication(didUrl).call();
    console.log("verification: " + JSON.stringify(verification));  
  
    // Controllo con recover di Web3 se corrispondono il numero di prima, come signature il proof (non prefissato di suo)
    // Link: https://web3js.readthedocs.io/en/v1.9.0/web3-eth-accounts.html#recover
  
    const recovered = await web3.eth.accounts.recover(randomNumber.toString(), proof.signatureValue);
    console.log("recovered: " + recovered);
  
    // Se corrisponde il controllo tra "recover" e l'account che ha inizializzato la verifica, allora è verificato
  
    if (recovered === accounts[0]) {
        localStorage.setItem("userIsLoggedIn", "true");
        localStorage.setItem('loggedDID', userDid);
        setUser({ did: userDid });
        setShowVerificationModal(false);
        navigate('/movies');
    } else {
        alert('La verifica non è andata a buon fine, si prega di riprovare.');
    }
  };

  const handleVerificationClose = () => {
    setShowVerificationModal(false);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <div className="form-group">
          <label htmlFor="did">DID</label>
          <input
            type="text"
            className="form-control"
            id="did"
            value={did}
            onChange={(e) => setDid(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Accedi
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
