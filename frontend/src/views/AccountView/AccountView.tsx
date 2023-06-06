import React, { useState } from "react";
import "./AccountView.css";
import { useAuth } from "../../context/AuthContext";
import Web3 from "web3";
import SelfSovereignIdentity from "../../contracts/SelfSovereignIdentity.json";
import { AbiItem } from 'web3-utils';
import { useNavigate } from "react-router-dom";
import Notification from "../../components/Notification/Notification";

export default function AccountView() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(sessionStorage.getItem("userData") ? JSON.parse(sessionStorage.getItem("userData") || "") : {});
  const [notification, setNotification] = useState<string | null>(null);

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

    sessionStorage.setItem("userData", JSON.stringify(updatedUserData));
    setUserData(updatedUserData);

    setNotification('Dati modificati con successo!');
    navigate('/account');
  };

  const handleDeleteAccount = async () => {
    setUser(null);
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('loggedIn');

    setNotification('Il tuo account è stato cancellato con successo!');

    navigate('/');
  };

  const closeNotification = () => {
    setNotification(null);
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
      {notification && (
        <Notification message={notification} onClose={closeNotification} />
      )}
    </div>
  );
}
