import React, { useEffect, useState } from "react";
import "./LoginView.css";
import SelfSovereignIdentity from "../../contracts/SelfSovereignIdentity.json";
import Web3 from "web3";
import { AbiItem } from 'web3-utils';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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

export default function LoginView() {

  const [did, setDid] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [randomNumber, setRandomNumber] = useState(0);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  const [userData, setUserData] = useState<any>({});

  useEffect(() => {
    async function fetchData() {
      const decryptedUserData = await decryptUserData();
      setUserData(decryptedUserData);
    }

    fetchData();
  }, []);
  
  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    const randomNumber = Math.floor(Math.random() * 1000000) + 1;
    setRandomNumber(randomNumber);
    setDid("");

    setShowVerificationModal(true);
  };

  const handleVerificationSubmit = async () => {
    try{
      const web3 = new Web3('http://localhost:8545');
      const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
      const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);
    
      const accounts = await web3.eth.getAccounts();
      
      const signature = await web3.eth.sign(randomNumber.toString(), accounts[0]);

      const userDid = await contract.methods.createDid().call({ from: accounts[0] }); 
      const didverifiable = userDid + "#key-1"; // DID + #key-1 because magically Alessio's contract wants it like this according to standards

      // Genero la prova contenente il metodo di verifica, un valore di proof e il proof purpose
      // Link: https://w3c.github.io/vc-data-integrity/#example-a-dataintegrityproof-example-using-a-nist-ecdsa-2022-cryptosuite
      const proof = {
        "@context": ["https://w3id.org/security/data-integrity/v1"],
        "type": "DataIntegrityProof",
        "cryptosuite": "ecdsa-2022",
        "created": new Date().toISOString(),
        "proofPurpose": "assertionMethod",
        "verificationMethod": userDid,
        "value": randomNumber.toString(),
        "signatureValue": signature,
      };
    
      //Calling the contract method to verify the proof
      const verification = await contract.methods.getAuthentication(didverifiable).call();

      // Checking if the proof is verified
      // Link: https://web3js.readthedocs.io/en/v1.9.0/web3-eth-accounts.html#recover
    
      const recovered = await web3.eth.accounts.recover(randomNumber.toString(), proof.signatureValue);

      if (recovered === verification[5]) { 
          setUser({ did: userDid });
          sessionStorage.setItem("loggedIn", "true");
          setShowVerificationModal(false);
          navigate('/movies');
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

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <div className="form-group">
          <label htmlFor="did">DID</label>
          <input
            type="text"
            className="form-control"
            id="did"
            value={did}
            onChange={(e) => setDid(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-login-primary">
          Accedi
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
        {userData && Object.keys(userData).length > 0 && (
            <div>
              <h3>User Data:</h3>
              <p>{JSON.stringify(userData)}</p>
            </div>
          )}
    </div>
  );
  
}
