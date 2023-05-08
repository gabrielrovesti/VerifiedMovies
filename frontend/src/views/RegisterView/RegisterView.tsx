import React, { useState, ChangeEvent } from "react";
import "./RegisterView.css";
import CreateDID from "../../utils/CreateDID";
import Web3 from "web3";
import SelfSovereignIdentity from "../../contracts/SelfSovereignIdentity.json";

export default function RegisterView() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [did, setDid] = useState(localStorage.getItem('userDID') || '');
  const [age, setAge] = useState(0);
  const [randomNumber, setRandomNumber] = useState(0);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [inputRandomNumber, setInputRandomNumber] = useState('');

const handleUsernameChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setUsername(event.target.value);
};

const handleEmailChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setEmail(event.target.value);
};

const handlePasswordChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setPassword(event.target.value);
};

const handleDateOfBirthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setDateOfBirth(event.target.value.toString());
  const age = calculateAge(new Date(event.target.value));
  setAge(age);
};

const calculateAge = (birthday: string | Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(birthday).getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return age;
};

const handleDidChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setDid(event.target.value);
};

const handleVerificationSubmit = () => {
  if (parseInt(inputRandomNumber) === randomNumber) {
  // Save user data to localStorage
  const userData = { username,email,password,dateOfBirth,did,age};
      localStorage.setItem('userData', JSON.stringify(userData));
      setShowVerificationModal(false);
      alert('Registrazione avvenuta con successo!');
  } else {
      alert('Il numero inserito non corrisponde a quello generato, riprova.');
  }
};

const handleVerificationClose = () => {
    setShowVerificationModal(false);
};

const handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    // Calculate user age
    const age = calculateAge(dateOfBirth);
    setAge(age);
    // Generate random number for verification
    const randomNumber = Math.floor(Math.random() * 1000000) + 1;
    setRandomNumber(randomNumber);

    setUsername("");
    setEmail("");
    setDateOfBirth("");
    setPassword("");
    setDid("");

    // Show verification modal
    setShowVerificationModal(true);
};

return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
      <h2>Inserisci qui i tuoi dati</h2>
        <div className="form-group">
          <label htmlFor="firstName">Username</label>
          <input type="text" className="form-control" id="firstName" value={username} onChange={handleUsernameChange} />
        </div>

        <div className="form-group">
          <label htmlFor="email">Indirizzo email</label>
          <input type="email" className="form-control" id="email" value={email} onChange={handleEmailChange} />
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth">Data di nascita</label>
          <input type="date" className="form-control" id="dateOfBirth" value={dateOfBirth} onChange={handleDateOfBirthChange} />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" className="form-control" id="password" value={password} onChange={handlePasswordChange} />
        </div>

        <div className="form-group">
          <label htmlFor="did">DID</label>
          <input type="text" className="form-control" id="did" value={did} onChange={handleDidChange} />
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
            <input
              type="text"
              placeholder="Inserisci qui il numero"
              value={inputRandomNumber}
              onChange={(event) =>
              setInputRandomNumber(event.target.value)
              }
            />
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