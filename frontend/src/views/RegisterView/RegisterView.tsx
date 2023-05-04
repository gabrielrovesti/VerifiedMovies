import React, { useState } from "react";
import "./RegisterView.css";
import Web3 from "web3";
import { AbiItem } from 'web3-utils';
import SelfSovereignIdentity from "../../contracts/SelfSovereignIdentity.json";

export default function RegisterView() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [userDid, setUserDid] = useState<string>();

  const handleFirstNameChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setLastName(event.target.value);
  };

  const handleEmailChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setPassword(event.target.value);
  };

  const handleDateOfBirthChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setDateOfBirth(event.target.value);
  };

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    // Connessione a Web3 e al contratto
    const web3 = new Web3('http://localhost:8545');
    const contractAddress = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512' //have to change it overtime, I guess
    const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);

    // Crea il DID dell'utente
    const accounts = await web3.eth.getAccounts();
    const userDid = await contract.methods.createDid().call({ from: accounts[0] });

    console.log(userDid);
    setUserDid(userDid);

    // Salva i dati inseriti dall'utente in localStorage
    const userData = {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      userDid
    };
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Mostra un messaggio di conferma
    alert('Registrazione avvenuta con successo!');
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h2>Inserisci qui i tuoi dati</h2>
        <div className="form-group">
          <label htmlFor="firstName">Nome</label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            value={firstName}
            onChange={handleFirstNameChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Cognome</label>
          <input
            type="text"
            className="form-control"
            id="lastName"
            value={lastName}
            onChange={handleLastNameChange}
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
          />
        </div>
        <div className="form-group">
          <label htmlFor="dateOfBirth">Data di nascita</label>
          <input
            type="date"
            className="form-control"
            id="dateOfBirth"
            value={dateOfBirth}
            onChange={handleDateOfBirthChange}
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
          Registrati
        </button>
      </form>
      {userDid && (
        <div>
          Il tuo DID per poter accedere è: {userDid}
        </div>
      )}
    </div>
  );
}