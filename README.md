# VerifiedMovies

![GitHub Banner](https://user-images.githubusercontent.com/40567147/159485872-7f63766a-3c91-48dc-aa37-fb5894232acc.png)

Project for Sync Lab Stage Implementation made with:
:pager: React + Typescript
:page_with_curl: Solidity + Hardhat + web3.js

## General Info

- The project follows the starter template from: <https://github.com/XamHans/React-Solidity-Typescript-Starter>
(one thing to note; Ethers gives A LOT of problems with TypeScript, so I had to use ONLY web3.js instead)
- It has to utilize the Self Sovereign Identity code by Alessio de Biasi, Computer Science Master Student at University of Ca' Foscari, Venice (SelfSovereignIdentity.sol) as a library in its implementation; the code is in the 'smart-contracts' folder.
He guided me through the whole process of understanding the logical flow of everything and I'm grateful because I just had to ask him; still, it's all myself here.
- Here "npm" was used everywhere; if you want to use "yarn" instead, you can, but you have to change the commands accordingly (don't mix the two, it will give you errors of any kind: I know).

## Features

- It utilizes a self made implementation of two W3C Standards: Decentralized Identifiers (DID) and Verifiable Credentials (VC), with Zero Knowledge Proof (ZKP) capabilities
- The verifiable credential follow the CL Signature scheme with a custom implementation (not yet fully standardized) for Zero Knowledge Proof sakes
- It also has a challenge-response mechanism based on DIDs used in login/registration; we're not using MetaMask to not depend on external clients
- The project is a prototype for a movie platform that allows users to watch movies only if they have a valid VC that proves they are over X years old, according to each age rating of the single movie
- The whole frontend has UX written in Italian, but comments and references in code are in English, so you can refer to those

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
