/* eslint-disable @typescript-eslint/no-unused-vars */
import SelfSovereignIdentity from "../contracts/SelfSovereignIdentity.json";
import Web3 from "web3";
import { AbiItem } from 'web3-utils';

export default async function CreateIssuers(){
    // Connecting to the blockchain
    const web3 = new Web3('http://localhost:8545');
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);

    // Issuers who the Certification Authority trusts and who can create DIDs
    // To see the DIDs, expect to make the "call" after "send", in order to see the data format you are dealing with here
    // This holds for createDid and createChildTrustedDid
    
    const accounts = await web3.eth.getAccounts();
    const issuer1 = await contract.methods.createDid().send({ from: accounts[1] });

    const message = "Trusted Issuers Creation"; // Message to create the signature upon

    // Creating the signature of the message with the private key of the issuer
    const signature = await web3.eth.sign(message, accounts[1]);

    // Creating child trusted issuers
    const childAddress_1 = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"; //account[2]

    // Creating DID for issuers going to create it, then I make "call" to see it - testing purposes as of now and clearer console logging 
    // NOTE: msg.sender is the CA that creates all the speech, based on the parent structure, so the signature and sender will always be the first account

    const result_1 = await contract.methods.createChildTrustedDid(childAddress_1, signature).send({from: accounts[1]});

    const childAddress_2 = "0x90f79bf6eb2c4f870365e785982e1f101e93b906"; //account[3]

    const result_2 = await contract.methods.createChildTrustedDid(childAddress_2, signature).send({from: accounts[1]});

    const childAddress_3 = "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65"; //account[4]

    const result_3 = await contract.methods.createChildTrustedDid(childAddress_3, signature).send({from: accounts[1]});
}