import React, { useEffect, useState } from "react";
import "./RegisterView.css";
import { AbiItem } from 'web3-utils';
import Web3 from "web3";
import SelfSovereignIdentity from "../../contracts/SelfSovereignIdentity.json";
import { encryptData, decryptData } from "../../utils/Safe";

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

export default function RegisterView() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [did, setDid] = useState('');
  const [age, setAge] = useState(0);
  const [randomNumber, setRandomNumber] = useState(0);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const [userData, setUserData] = useState<any>({});

  useEffect(() => {
    async function fetchData() {
      const decryptedUserData = await decryptUserData();
      setUserData(decryptedUserData);
    }
    fetchData();
  }, []);

  const handleUsernameChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setUsername(event.target.value);
  };

  const handleEmailChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setEmail(event.target.value);
  };

  const handleDateOfBirthChange = (event: { target: { value: string | number | Date; }; }) => {
    setDateOfBirth(event.target.value.toString());
    const age = calculateAge(new Date(event.target.value));
    setAge(age);
  };

  const calculateAge = (birthday: string | number | Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(birthday).getTime();
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return age;
  };

  const handleDidChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setDid(event.target.value);
  };

  const checkEmailExisting = (email: string) => {
 
    if (userData && userData.email === email) {
      alert('L\'email fornita esiste già. Per favore, usane un\'altra.');
      return true;
    }
  
    return false;
  };
  
  const checkDidExisting = (did: string) => {
 
    if (userData && userData.did === did) {
      alert('Il DID fornito esiste già. Per favore, usane un altro.');
      return true;
    }
  
    return false;
  };

  const handleVerificationSubmit = async () => {
    const isEmailExisting = checkEmailExisting(email);
    const isDidExisting = checkDidExisting(did);

    if (isEmailExisting) {
      alert('L\'email fornita esiste già. Per favore, usane un\'altra.');
      return;
    } 

    if (isDidExisting) {
      alert('Il DID fornito esiste già. Per favore, usane un altro.');
      return;
    } 

    try{
      // Meccanismo challenge-response di registrazione e login per non dipendere da piattaforme esterne
      // (es. Metamask) che sono stato costretto a dover implementare per poi sentirmi dire di non doverlo fare

      // Connessione a Web3 e al contratto
      const web3 = new Web3('http://localhost:8545');
      const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
      const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);

      // Prendo l'account dell'utente
      const accounts = await web3.eth.getAccounts();
      
      // Firmo il messaggio
      const signature = await web3.eth.sign(randomNumber.toString(), accounts[0]);

      // Sending the DID from account X to the contract - creating it, calling it and then sending it
      const userDid = await contract.methods.createDid().send({ from: accounts[0] }); 

      const did_correct = await contract.methods.createDid().call({ from: accounts[0] }); 
      const didverifiable = did_correct + "#key-1";

      // Genero la prova contenente il metodo di verifica, un valore di proof e il proof purpose
      // Link: https://w3c.github.io/vc-data-integrity/#example-a-dataintegrityproof-example-using-a-nist-ecdsa-2022-cryptosuite
      const proof = {
        "@context": "https://www.w3.org/2018/credentials/v1",
        "type": "DataIntegrityProof",
        "created": new Date().toISOString(),
        "proofPurpose": "authentication",
        "verificationMethod": userDid,
        "value": randomNumber.toString(),
        "signatureValue": signature,
      };

      // Chiamo lo smart contract per verifica
      const verification = await contract.methods.getAuthentication(didverifiable).call();

      // Controllo con recover di Web3 se corrispondono il numero di prima, come signature il proof (non prefissato di suo)
      // Link: https://web3js.readthedocs.io/en/v1.9.0/web3-eth-accounts.html#recover

      const recovered = await web3.eth.accounts.recover(randomNumber.toString(), proof.signatureValue);

      // Se corrisponde il controllo tra "recover" e l'account che ha inizializzato la verifica, allora è verificato
      
      if (recovered === verification[5]) {
          const userData = {username,email,dateOfBirth,did,age};

          // Encrypt the userData object
          const encryptedUserData = await encryptData(JSON.stringify(userData));

          // Store the encrypted data in localStorage
          localStorage.setItem("encryptedUserData", JSON.stringify(encryptedUserData));
          
          setShowVerificationModal(false);
          alert('Registrazione avvenuta con successo!');
      } else {
          alert('La verifica non è andata a buon fine, si prega di riprovare.');
      }
    }
    catch(error){
      console.log(error);
    }    
};

const handleVerificationClose = () => {
    setShowVerificationModal(false);
};

const handleSubmit = (event: { preventDefault: () => void; }) => {
  event.preventDefault();

  if (!username || !email || !dateOfBirth || !did) {
    alert("Per favore, inserisci tutti i campi.");
    return;
  }

  const age = calculateAge(dateOfBirth);
  setAge(age);

  const randomNumber = Math.floor(Math.random() * 1000000) + 1;
  setRandomNumber(randomNumber);


  setShowVerificationModal(true);
};

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h2>Inserisci qui i tuoi dati</h2>
        <div className="form-group">
          <label htmlFor="firstName">Username</label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            value={username}
            onChange={handleUsernameChange}
            required
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
            onChange={handleDateOfBirthChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="did">DID</label>
          <input
            type="text"
            className="form-control"
            id="did"
            value={did}
            onChange={handleDidChange}
            required
          />
        </div>

        <button type="submit" className="btn-primary btn-register">
          Registrati
        </button>
      </form>
      {showVerificationModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Conferma la tua identità.</h2>
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