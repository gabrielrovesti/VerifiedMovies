/* eslint-disable @typescript-eslint/no-unused-vars */
import SelfSovereignIdentity from "../contracts/SelfSovereignIdentity.json";
import Web3 from "web3";
import { AbiItem } from 'web3-utils';

export default async function CreateIssuers(){
    // Connessione a Web3 e al contratto
    const web3 = new Web3('http://localhost:8545');
    const contractAddress = '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F'
    const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);

    //Creazione degli Issuer di cui si fida l'utente
    const accounts = await web3.eth.getAccounts();
    const issuer1 = await contract.methods.createDid().send({ from: accounts[1] });
    const issuer1_did = await contract.methods.createDid().call({ from: accounts[1] });

    console.log("Certification Authority user trusted created with DID", issuer1_did);

    const message = "Trusted Issuers Creation"; // Messaggio da firmare (può essere qualsiasi cosa, qui per semplicità è una stringa firmata dalla CA)

    //Creazione della firma unica emessa dalla Certification Authority
    const signature = await web3.eth.sign(message, accounts[1]);

    //Creazione degli issuer figli fidati
    const childAddress_1 = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"; //account[2]

    // Creazione del DID per gli issuer andando a crearlo, poi faccio "call" per vederlo - testing purposes as of now and clearer console logging 
    // NOTA: msg.sender è la CA che crea tutto il discorso, in base alla struttura parent, quindi la firma e il sender saranno sempre il primo account
    // in questo contesto, oppure va out ouf bounds

    const result_1 = await contract.methods.createChildTrustedDid(childAddress_1, signature).send({from: accounts[1]});
    console.log(result_1) // this is the transaction result
    const did_issuer_1 = await contract.methods.createChildTrustedDid(childAddress_1, signature).call({from: accounts[2]});
    console.log("Issuer 2 Created with DID:", did_issuer_1); //called to see DIDs

    const childAddress_2 = "0x90f79bf6eb2c4f870365e785982e1f101e93b906"; //account[3]

    const result_2 = await contract.methods.createChildTrustedDid(childAddress_2, signature).send({from: accounts[1]});
    console.log(result_2)
    const did_issuer_2 = await contract.methods.createChildTrustedDid(childAddress_2, signature).call({from: accounts[3]});
    console.log("Issuer 3 Created with DID:", did_issuer_2);

    const childAddress_3 = "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65"; //account[4]

    const result_3 = await contract.methods.createChildTrustedDid(childAddress_3, signature).send({from: accounts[1]});
    console.log(result_3)
    const did_issuer_3 = await contract.methods.createChildTrustedDid(childAddress_3, signature).call({from: accounts[4]});
    console.log("Issuer 4 Created with DID:", did_issuer_3);
}