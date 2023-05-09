import SelfSovereignIdentity from "../contracts/SelfSovereignIdentity.json";
import Web3 from "web3";
import { AbiItem } from 'web3-utils';

export default async function CreateDID(){
// Connessione a Web3 e al contratto
const web3 = new Web3('http://localhost:8545');
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3' //have to change it overtime, I guess
const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);

// Crea il DID dell'utente
const accounts = await web3.eth.getAccounts();
const userDid = await contract.methods.createDid().call({ from: accounts[0] });  

return userDid;
}