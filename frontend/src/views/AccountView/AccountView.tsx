import React, { useEffect, useState } from "react";
import "./AccountView.css";
import { useAuth } from "../../context/AuthContext";
import Web3 from "web3";
import SelfSovereignIdentity from "../../contracts/SelfSovereignIdentity.json";
import { AbiItem } from 'web3-utils';
import { useNavigate } from "react-router-dom";
import { decryptData } from "../../utils/Safe";

async function decryptUserData() {
  const encryptedUserData = JSON.parse(localStorage.getItem("encryptedUserData") || "{}");
  const encryptedData = new Uint8Array(encryptedUserData.encryptedData);
  const iv = encryptedUserData.iv ? new Uint8Array(encryptedUserData.iv) : new Uint8Array(0);
  if (encryptedData.byteLength === 0) {
    return null;
  }
  const decryptedData = await decryptData(encryptedData, iv);
  return JSON.parse(decryptedData);
}

export default function AccountView() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>({});

  useEffect(() => {
    async function fetchData() {
      const decryptedUserData = await decryptUserData();
      setUserData(decryptedUserData);
    }

    fetchData();
  }, []);
  
  const [username, setUsername] = useState(userData?.username || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [dateOfBirth, setDateOfBirth] = useState(userData?.dateOfBirth || '');
  
  const handleEditProfile = () => {
    const updatedUserData = {
      username,
      email,
      dateOfBirth,
      did: user?.did || "", 
    };

    localStorage.setItem("userData", JSON.stringify(updatedUserData));
    setUser(updatedUserData);

    alert('Dati modificati con successo!');

    navigate('/account');
  };

  const handleDeleteAccount = async () => {
    const web3 = new Web3('http://localhost:8545');
    const contractAddress = '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F';
    const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);

    const accounts = await web3.eth.getAccounts();

    // Deactivate the user's DID document
    await contract.methods.deactivate().send({ from: accounts[0] });

    // Perform other necessary cleanup tasks, such as clearing local storage or session data
    setUser(null);

    // Show a confirmation message
    alert('Il tuo account è stato cancellato con successo!');

    // Redirect the user to the login page
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
          <button type="button" className="btn btn-primary" onClick={handleDeleteAccount}>
            Cancella account
          </button>
        </div>
      </form>
    </div>
  );
}
