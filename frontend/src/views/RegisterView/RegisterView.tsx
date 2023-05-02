import React, { useState } from "react";
import "./RegisterView.css";
import { ethers } from "ethers";

export default function RegisterView() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(event.target.value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleDateOfBirthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateOfBirth(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    try {
      // Creare un'istanza del provider di ethers.js
      const provider = new ethers.JsonRpcProvider();
  
      // Ottenere l'indirizzo del contratto UserRegistration
      const userRegistrationAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

      const userRegistrationABI = ["function registerUser(string memory firstName, string memory lastName, string memory dateOfBirth) public"];
  
      // Creare un'istanza del contratto UserRegistration
      const userRegistrationContract = new ethers.Contract(userRegistrationAddress, userRegistrationABI, await provider.getSigner());
  
      // Chiamare la funzione "registerUser" del contratto
      await userRegistrationContract.registerUser(firstName, lastName, dateOfBirth);
      console.log("User registered successfully")
    } catch (error) {
      // Gestire l'errore e mostrare un messaggio all'utente
      console.error(error);
      
    }
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
    </div>
  );
}