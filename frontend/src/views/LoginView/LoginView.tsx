import React, { useState } from "react";
import "./LoginView.css";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext";

export default function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
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
      // Disconnect from MetaMask if already connected
      if (window.ethereum && window.ethereum.selectedAddress) {
        await (window.ethereum as any).request({ method: 'eth_requestAccounts', params: [{ eth_accounts: [] }] });
      }
  
      // Connect to MetaMask
      await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
  
      // Generate the user's DID using the SelfSovereignIdentity smart contract
      // ...
  
      // Navigate to the movies page
      navigate('/movies');
    } catch (error) {
      console.error(error);
      setError('Error connecting to MetaMask. Please try again.');
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
  
        // Imposta lo stato di autenticazione a true
        authContext.login();
  
        const connectWalletButton = document.getElementById("connect-wallet-button");
        if (connectWalletButton) {
          connectWalletButton.style.display = "block";
        }
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
        <button type="submit" className="btn btn-primary">
          Accedi
        </button>
        {error && <p>{error}</p>}
        <p></p>
        <button type="button" id="connect-wallet-button" className="btn btn-primary" style={{ display: "none" }} onClick={handleConnectWallet}>Connetti il tuo wallet a MetaMask</button>
      </form>
    </div>
  );
}