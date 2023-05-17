import React, { useState } from "react";
import "./AccountView.css";
import { useAuth } from "../../context/AuthContext";
import Web3 from "web3";
import SelfSovereignIdentity from "../../contracts/SelfSovereignIdentity.json";
import { AbiItem } from 'web3-utils';
import { useNavigate } from "react-router-dom";

export default function AccountView() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Retrieve user information from localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const [username, setUsername] = useState(userData.username || '');
  const [email, setEmail] = useState(userData.email || '');
  const [password, setPassword] = useState(userData.password || '');
  const [dateOfBirth, setDateOfBirth] = useState(userData.dateOfBirth || '');
  
  const handleEditProfile = () => {
    const updatedUserData = {
    did: user?.did || "", // Optional chaining to access the value safely
    };

    localStorage.setItem("userData", JSON.stringify(updatedUserData));
    setUser(updatedUserData);
    navigate('/account');
  };

  const handleDeleteAccount = async () => {
    const web3 = new Web3('http://localhost:8545');
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);

    // Prendo l'account dell'utente
    const accounts = await web3.eth.getAccounts();
    //const userDid = localStorage.getItem('loggedDID');

    // Deactivate the user's DID document
    await contract.methods.deactivate().send({ from: accounts[0] });

    // Perform other necessary cleanup tasks, such as clearing local storage or session data

    localStorage.removeItem('userData');
    localStorage.removeItem('loggedDID');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="account-container">
      <h2>Informazioni del tuo profilo</h2>
      <form>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="dateOfBirth">Data di nascita</label>
          <input
            type="date"
            className="form-control"
            id="dateOfBirth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </div>
        <div className="button-container">
          <button type="submit" className="btn btn-primary" onClick={handleEditProfile}>
            Aggiorna profilo
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDeleteAccount}>
            Cancella account
          </button>
        </div>
      </form>
    </div>
  );
}
