import SelfSovereignIdentity from "../contracts/SelfSovereignIdentity.json";
import Web3 from "web3";
import { AbiItem } from 'web3-utils';

export default async function CreateIssuers(){
    // Connessione a Web3 e al contratto
    const web3 = new Web3('http://localhost:8545');
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const contract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[], contractAddress);

    //Creazione degli Issuer di cui si fida l'utente
    const accounts = await web3.eth.getAccounts();
    const issuer1 = await contract.methods.createDid().send({ from: accounts[1] });
    console.log("Boss Issuer", issuer1);

    const message = "Trusted Issuers Creation";

    //Creazione della firma unica emessa dalla Certification Authority

    const signature = await web3.eth.sign(message, accounts[1]);

    //Creazione degli issuer figli fidati
    const childAddress_1 = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"; //account[2]

    const result_1 = await contract.methods.createChildTrustedDid(childAddress_1, signature).send({
        from: accounts[2],
        gas: 1500000,
        gasPrice: '30000000000000'
    });

    console.log("Issuer 2 Created", JSON.stringify(result_1));

    const childAddress_2 = "0x90f79bf6eb2c4f870365e785982e1f101e93b906"; //account[3]

    const result_2 = await contract.methods.createChildTrustedDid(childAddress_2, signature).send({
        from: accounts[3],
        gas: 1500000,
        gasPrice: '30000000000000'
    });

    console.log("Issuer 3 Created", JSON.stringify(result_2));

    const childAddress_3 = "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65"; //account[4]

    const result_3 = await contract.methods.createChildTrustedDid(childAddress_3, signature).send({
        from: accounts[4],
        gas: 1500000,
        gasPrice: '30000000000000'
    });

    console.log("Issuer 4 Created", JSON.stringify(result_3));
}