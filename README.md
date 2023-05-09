![GitHub Banner](https://user-images.githubusercontent.com/40567147/159485872-7f63766a-3c91-48dc-aa37-fb5894232acc.png)

Project for Sync Lab Stage Implementation made with:
:pager: React + Vite + Typescript
 :page_with_curl: Solidity + Hardhat + Typescript

## General Info
- The project follows the starter template from: https://github.com/XamHans/React-Solidity-Typescript-Starter
- It uses the Self Sovereign Identity code by Alessio de Biasi (SelfSovereignIdentity.sol) as a library in its implementation

## How to start and run the project

### Backend

pre: cd into /smart-contracts

#### General commands
0) start local testnet ---> npm run testnet
1) Compile contracts ---> npm run build
2) Test contracts -->     npm run test
3) Deploy contracts -->   npm run deploy

##### Practical commands
First terminal:
> npx hardhat node 
or 
> npm run testnet

- Importing account
Take one account from the hardhat node and login in Metamask. Copy one private key and connect it to
a custom net which can find Hardhat (name it, for instance Hardhat-Localhost with localhost:8545 as address), and you will get 10000 ETH as test.

Second terminal:
> npm run compile
> npm run deploy

- Copy the 'SelfSovereignIdentity.sol' that generated from the deploy script into the 'frontend/src/contracts' folder

### Frontend
pre: cd into /frontend

#### General commands
1) Install dependencies ---> npm install
2) start frontend ---> npm run dev
3) build --> npm run build

##### Practical commands
> npm start