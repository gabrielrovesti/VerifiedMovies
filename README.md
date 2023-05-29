# VerifiedMovies

![GitHub Banner](https://user-images.githubusercontent.com/40567147/159485872-7f63766a-3c91-48dc-aa37-fb5894232acc.png)

Project for Sync Lab Stage Implementation made with:
:pager: React + Typescript
:page_with_curl: Solidity + Hardhat + web3.js

## General Info

- The project follows the starter template from: <https://github.com/XamHans/React-Solidity-Typescript-Starter>
(one thing to note; Ethers gives A LOT of problems with TypeScript, so I had to use ONLY web3.js instead)
- I was forced to implement the Self Sovereign Identity code by Alessio de Biasi, Computer Science Master Student at University of Ca' Foscari, Venice (SelfSovereignIdentity.sol) as a library in its implementation
still, it's all DIY, cause he was not that helpful. He helped figure out some parts of the process,
but it's that kind of person which seems nice but in reality, "just do it yourself".
Yet, I managed to do everything by myself, as always.
- Here "npm" was used everywhere; if you want to use "yarn" instead, you can, but you have to change the commands accordingly (don't mix the two, it will give you errors of any kind: I know).

## Features

- It utilizes a self made implementation of two W3C Standards: Decentralized Identifiers (DID) and Verifiable Credentials (VC), with Zero Knowledge Proof (ZKP) capabilities
- The verifiable credential follow the CL Signature scheme with a custom implementation (not yet fully standardized) for Zero Knowledge Proof sakes correclty and fully explained inside code; also, you can fin EC for the curve secp256k1
used by Bitcoin as the underlying elliptic curve for the signature scheme
- It also has a challenge-response mechanism based on DIDs used in login/registration; we're not using MetaMask to not depend on external clients (requirement from Alessio, then he changed his mind after a week of struggles, I kept it anyway)
- The project is a prototype for a movie platform that allows users to book movies only if the user is X years old:
he presents a Verifiable Credential (VC), wrapped into a Verifiable Presentation (VP) to the platform without sharing any personal data with CL Signature that assures Zero Knowledge Proof.
- It then verifies the whole process and if the credential was issued by a specific issuer, which is the last node
of an ipothetic chain of trust, which is the only one that can issue the credential, and if the credential is still valid (not expired), then the user can book the movie.
- The user can also share the movie, leave a rating, see the all ratings and handle its profile.
- Because I had to make everything myself, forgive the code state, but for a Bachelor's Degree Thesis, it's more than enough.

## How to start and run the project

### Backend

pre: cd into /smart-contracts and install dependencies with 'npm install'

#### General commands

0) Start local testnet > npm run testnet
1) Compile contracts > npm run build
2) Test contracts > npm run test
3) Deploy contracts > npm run deploy

##### Practical commands

Here will be listed the handmade scripts that I made to make the process easier.

First terminal (activates local testnet and gives test accounts) --> remember to keep this one open
> npm run testnet

- For the sake of simplicity, inside code are used always the same X test accounts from Hardhat, simulating different users each time

Second terminal:

- First we clean the 'artifacts' folder, then we compile the contract

> npm run compile

- After that, we deploy the contract on the local testnet

> npm run deploy

- Copy only the 'SelfSovereignIdentity.json' that generated from the folder 'artifacts/contracts/SelfSovereignIdentity.sol' folder into the 'frontend/src/contracts' folder in order to retrieve the correct ABI and not run out of gas.
If you don't make major changes to the contract, you can just copy the one I already put there, cause the addresses (luckily for me),
are always the same.

### Frontend

pre: cd into /frontend and install dependencies with 'npm install'

#### All commands

1) Install dependencies ---> npm install
2) start frontend ---> npm run dev
3) build --> npm run build

##### In practice

> npm start

##### Testing data

- If the Hardhat accounts change, remember to change contract address and relative accounts inside code
- Also, if you need a testing DID, you can use: ```did:ssi-cot-eth:1337:f39fd6e51aad88f6f4ce6ab8827279cfffb92266```
- If for some weird reason, login does not work, you need to register and put
a valid DID format for Alessio's contract, just as I did.
