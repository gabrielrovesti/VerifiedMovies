import React, { useState } from "react";
import "./LoginView.css";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext";
import SelfSovereignIdentity from "../../contracts/SelfSovereignIdentity.json";
import Web3 from "web3";
import { AbiItem } from 'web3-utils';

export default function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const authContext = React.useContext(AuthContext) ?? { isAuthenticated: false, login: () => {}, logout: () => {} };
  const navigate = useNavigate();

  //Used for checks before login
  const userDid = localStorage.getItem('userDid');

  //Will be used for zero-knowledge proof as soon as I'll understand how to use it
  const dateOfBirth = localStorage.getItem('dateOfBirth');
  
  //Useful credential sample and I'll keep it here in case I'll need it again
  const ageCredential = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential', 'AgeCredential'],
    issuer: userDid,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: userDid,
      age: 18,
    }
  };

  const handleEmailChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setPassword(event.target.value);
  };

  const handleConnectWallet = async () => {
    try {
      if (!isVerified) {
        setError('Please complete the verification to continue.');
        return;
      }

      // Disconnect from MetaMask if already connected
      if (window.ethereum && window.ethereum.selectedAddress) {
        await (window.ethereum as any).request({ method: 'eth_requestAccounts', params: [{ eth_accounts: [] }] });
      }

      // Connect to MetaMask
      await (window.ethereum as any).request({ method: 'eth_requestAccounts' });

      // Generate the user's DID using the SelfSovereignIdentity smart contract deployed locally

      // Navigate to the movies page
      navigate('/movies');
    } catch (error: string | any) {
      console.error(error);
      setError('Errore di connessione a Metamask causato da: ' + error.message ?? 'Errore sconosciuto');
    }
  };

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    // Connessione a Web3 e al contratto
    const web3 = new Web3('http://localhost:8545');
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3' //have to change it overtime, I guess
    const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);

    // Connessione a MetaMask e recupero degli account
    const accounts = await web3.eth.getAccounts();
    
    // Creazione dell'indirizzo Ethereum del DID figlio
    const childAddress = web3.utils.toChecksumAddress(web3.utils.randomHex(20));
    const childDid = `did:ethr:${childAddress}`;
    
    // Generazione della firma utilizzando l'account del sito
    const signature = await web3.eth.sign(childDid, accounts[0]);
    
    // Certifica il DID figlio per accedere al sito
    await contract.methods.createChildTrustedDid(childAddress, signature).send({ from: accounts[0] });

    const userData = localStorage.getItem('userData');
    if (userData !== null) {
      const parsedUserData = JSON.parse(userData);
      if (parsedUserData.email === email && parsedUserData.password === password) {

        // Save user email and password to localStorage
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);

        // Imposta lo stato di autenticazione a true
        authContext.login();

        // registra il sito come servizio autorizzato per l'utente
        await contract.methods.addService("VerifiedMovies", "movies-site", 'https://localhost:3000').send({ from: accounts[0] });

        setIsVerified(true); // setta il valore di isVerified a true per mostrare il bottone di connessione a MetaMask
        setError('Verifica dei dati in corso...'); // mostra un messaggio all'utente

      } else {
        // Login failed
        setError('Invalid email or password');
      }
    } else {
      // Login failed
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Accedi per continuare</h2>
        <div className="form-group">
          <label htmlFor="email">Indirizzo email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={handleEmailChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {isVerified ? (
          <button type="button" className="btn btn-primary" onClick={handleConnectWallet}>
            Connetti il tuo wallet con MetaMask
          </button>
        ) : (
          <div className="captcha-container">
            <h4>Per continuare, completa la seguente verifica:</h4>
            <img src="captcha.png" alt="" />
            <button type="button" className="btn btn-secondary" onClick={() => setIsVerified(true)}>
              Verifica completata
            </button>
          </div>
        )}
        <button type="submit" className="btn btn-success">
          Accedi
        </button>
      </form>
    </div>
  );
}