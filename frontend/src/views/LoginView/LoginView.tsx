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
  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [isAuthenticatingWithMetamask, setIsAuthenticatingWithMetamask] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMetamaskButton, setShowMetamaskButton] = useState(false);
  const [isMetamaskModalOpen, setIsMetamaskModalOpen] = useState(false);
  const authContext = React.useContext(AuthContext) ?? { isAuthenticated: false, login: () => {}, logout: () => {} };
  const navigate = useNavigate();

  const handleEmailChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setPassword(event.target.value);
  };

  const handleConnectWallet = async () => {
    try {
      setIsAuthenticatingWithMetamask(true);
      setIsLoading(true);

      // Disconnect from MetaMask if already connected
      if (window.ethereum && window.ethereum.selectedAddress) {
        await (window.ethereum as any).request({ method: 'eth_requestAccounts', params: [{ eth_accounts: [] }] });
      }

      // Connect to MetaMask
      await (window.ethereum as any).request({ method: 'eth_requestAccounts' });

      // Connessione a Web3 e al contratto
      const web3 = new Web3('http://localhost:8545');
      const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3' //have to change it overtime, I guess
      const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);

      // Connessione a MetaMask e recupero degli account
      const accounts = await web3.eth.getAccounts();
      
      // Creazione dell'indirizzo Ethereum del DID figlio
      const childAddress = web3.utils.toChecksumAddress(web3.utils.randomHex(20));
      console.log("childAddress: ", childAddress);
      const childDid = `did:ethr:${childAddress}`;

      // Generazione della firma utilizzando l'account di Metamask
      const signature = await web3.eth.personal.sign(childDid, accounts[0], password);
      console.log("signature: ", signature);

      // Certifica il DID figlio per accedere al sito
      const delegation_of_trust_document = contract.methods.createChildTrustedDid(childAddress, signature).send({ from: accounts[0] });
      console.log("certification: ", delegation_of_trust_document);

      //Have to call resolve(string memory did) in order to properly verify the user was the specified one 
      //maybe even resolvechain, which returns the chain of trust having as last node the user with specified DID
      //and then verify the chain of trust. Can think also of calling getAuthentication() and verify the signature (have to pass the didUrl as parameter, which is the one
      //returned by the createChildTrustedDid function)

      // Imposta lo stato di autenticazione a true
      authContext.login();

      // registra il sito come servizio autorizzato per l'utente
      await contract.methods.addService("VerifiedMovies", "movies-site", 'https://localhost:3000').send({ from: accounts[0] });

      setIsMetamaskConnected(true);
      setIsMetamaskModalOpen(false);
      // Naviga alla pagina dei film
      navigate('/movies');
    } catch (error: string | any) {
      console.error(error);
      setError('Errore di connessione a Metamask causato da: ' + error.message ?? 'Errore sconosciuto');
      setIsLoading(false);
    } finally {
      setIsAuthenticatingWithMetamask(false);
    }
  };

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    const userData = localStorage.getItem('userData');
    if (userData !== null) {
      const parsedUserData = JSON.parse(userData);
      if (parsedUserData.email === email && parsedUserData.password === password) {

        // Save user email and password to localStorage
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);

        // Imposta lo stato di verifica a true per mostrare il bottone di connessione a MetaMask
        setIsVerified(true);
        setShowMetamaskButton(true);

        // mostra un messaggio all'utente
        setError('');

      } else {
        // Login failed
        setError('Email o password non validi');
      }
    } else {
      // Login failed
      setError('Email o password non validi');
    }
  };

  return (
    <div className="login-container">
      {!isVerified ? (
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
          <button type="submit" className="btn btn-primary">
            Accedi
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      ) : (
        <>
          {showMetamaskButton ? (
            <button className="btn btn-primary" onClick={() => setIsMetamaskModalOpen(true)}>
              Connettiti con MetaMask per continuare
            </button>
          ) : (
            <p>Verifica dei dati completata con successo</p>
          )}
          {error && <p className="error">{error}</p>}
        </>
      )}
      {isMetamaskModalOpen && (
        <div className="metamask-modal">
          <div className="metamask-modal-content">
            <h2>Connettiti a MetaMask</h2>
            <p>Per accedere a questo sito, devi connetterti con MetaMask.</p>
            {isAuthenticatingWithMetamask ? (
              <p>Connessione in corso...</p>
            ) : (
              <button className="btn btn-primary" onClick={handleConnectWallet}>Procedi</button>
            )}
            {error && <p className="error">{error}</p>}
            <button className="close-modal" onClick={() => setIsMetamaskModalOpen(false)}>
              Chiudi
            </button>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
}