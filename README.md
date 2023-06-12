# VerifiedMovies

![Logo](./frontend/src/img/logo.png)

Project for Sync Lab Stage Implementation made with:
:pager: React + Typescript
:page_with_curl: Solidity + Hardhat + web3.js

## General Info

- The project follows the starter template from: <https://github.com/XamHans/React-Solidity-Typescript-Starter>
(one thing to note; Ethers gives A LOT of problems with TypeScript, so I had to use ONLY web3.js instead, which already was a pain to deal with)
- Movies images and data were taken from by IMDB and the background image was taken from Unsplash
- I was forced to implement the Self Sovereign Identity code by Alessio De Biasi, Computer Science Master Student at University of Ca' Foscari, Venice (SelfSovereignIdentity.sol) as a library in its implementation. I did it myself still, cause confronting with him was not a good experience, DIY is the key.
- Here "npm" was used everywhere; if you want to use "yarn" instead, you can, but you have to change the commands accordingly (don't mix the two, it will give you errors of any kind: I know).

## Features

- It utilizes a self made implementation of two W3C Standards: Decentralized Identifiers (DID) and Verifiable Credentials (VC), with Zero Knowledge Proof (ZKP) capabilities (all relevant sources are listed in code and my thesis)
- The verifiable credential follow the CL Signature scheme with a custom implementation (not yet fully standardized) for Zero Knowledge Proof sakes correclty and fully explained inside code; also, you can fin EC for the curve ```secp256k1``` used by Bitcoin as the underlying elliptic curve for the signature scheme
- It also has a challenge-response mechanism based on DIDs used in login/registration; we're not using MetaMask to not depend on external clients (requirement from Alessio, then he changed his mind after a week of struggles, I kept it anyway)
- The project is a prototype for a movie platform that allows users to book movies only if the user is X years old:
he presents a Verifiable Credential (VC), wrapped into a Verifiable Presentation (VP) to the platform without sharing any personal data with CL Signature that assures Zero Knowledge Proof.
- It then verifies the whole process and if the credential was issued by a specific issuer, which is the last node
of an ipothetic chain of trust, which is the only one that can issue the credential, and if the credential is still valid (not expired), then the user can book the movie.
- The user can also share the movie, leave a rating, see the all ratings and handle its profile.
- Because I had to make everything myself, forgive the code state, but for a Bachelor's Degree Thesis, it's more than enough.

## How to start and run the project

### Backend

pre: cd into ```/smart-contracts``` and install dependencies with ```npm install```

#### General commands

0) Start local testnet > ```npm run testnet```
1) Compile contracts > ```npm run build```
2) Test contracts > ```npm run test```
3) Deploy contracts > ```npm run deploy```

##### Practical commands

Here will be listed the handmade scripts that I made to make the process easier.

First terminal (activates local testnet and gives test accounts) --> remember to keep this one open
> ```npm run testnet```

- For the sake of simplicity, inside code are used always the same X test accounts from Hardhat, simulating different users each time and the whole chain of trust mechanism.

Second terminal:

- First we clean the ```artifacts``` folder, then we compile the contract

> ```npm run compile```

- After that, we deploy the contract on the local testnet

> ```npm run deploy```

- Copy only the ```SelfSovereignIdentity.json``` that generated from the folder ```artifacts/contracts/SelfSovereignIdentity.sol``` folder into the ```frontend/src/contracts``` folder in order to retrieve the correct ABI and not run out of gas.
If you don't make major changes to the contract, you can just use the alread present "json", cause the addresses are always the same; otherwise, remember to change them in code. They are hardcoded for simplicity.

### Frontend

pre: cd into ```/frontend``` and install dependencies with ```npm install```

#### All commands

1) Install dependencies > ```npm install```
2) Start for debugging > ```npm run dev```
3) Build for production > ```npm run build```
4) Run Jest tests > ```npm run test```

##### In practice

> ```npm start```

##### Testing data

- If the Hardhat accounts change, remember to change contract address and relative accounts inside code
- Also, if you need a testing DID, you can use: ```did:ssi-cot-eth:1337:f39fd6e51aad88f6f4ce6ab8827279cfffb92266``` (if contract is deployed on address ```0x5FbDB2315678afecb367f032d93F642f64180aa3```)
- At startup, login probably won't work, cause there are no users in the database, so you have to register one and then logging in; to proper handle the checks inside, remember to use my DID, which is the one above.
It should work anyway with others, but this way is compliant to both standards and the smart contract itself

### Future improvements

- The project is a prototype, so it's not perfect, but it's a good starting point for a real world application using SSI and ZKP as a toy example; you can extend it encrypting keys usage, calling a server via HTTPS, etc.
- The last version of the project configures everything to make the project work importing the complete library code and the ```ChainOfTrustSsi.sol```, the full version of the existing smart contract; that one has everything compliant to standard and the application can be extended using only that code instead. Refer to that in case (I did already the heavy lifting solving all compatibility problems; have fun if you will, already did more than enough). The deploy script already considers that contract too with existing commands.

## Sources

My Bachelor's Degree Thesis written on this: <https://github.com/gabrielrovesti/Stage-e-tesi-UniPD/blob/main/Tesi/tesi.pdf>
