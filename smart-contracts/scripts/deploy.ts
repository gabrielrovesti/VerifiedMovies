/*
import { ethers } from 'ethers'
import * as fs from 'fs'

const SSI_ARTIFACTS_PATH = 'artifacts/contracts/SelfSovereignIdentity.sol/SelfSovereignIdentity.json'

async function main () {
  const provider = new ethers.providers.JsonRpcProvider()
  const signer = provider.getSigner()

  // Load the contract artifact files
  const SelfSovereignIdentityArtifact = JSON.parse(
    fs.readFileSync(SSI_ARTIFACTS_PATH, 'utf8')
  )

  const SelfSovereignIdentityAbi = SelfSovereignIdentityArtifact.abi
  const SelfSovereignIdentityBytecode = SelfSovereignIdentityArtifact.bytecode

  // Deploy the SelfSovereignIdentity contract first
  const ssiFactory = new ethers.ContractFactory(
    SelfSovereignIdentityAbi,
    SelfSovereignIdentityBytecode,
    signer
  )
  const ssiContract = await ssiFactory.deploy()
  await ssiContract.deployed()

  console.log('SelfSovereignIdentity deployed to:', ssiContract.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

*/

import Web3 from 'web3'
import SelfSovereignIdentity from '../artifacts/contracts/SelfSovereignIdentity.sol/SelfSovereignIdentity.json'
import { AbiItem } from 'web3-utils'

async function main () {
  const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

  // Deploy the SelfSovereignIdentity contract first
  const ssiContract = new web3.eth.Contract(SelfSovereignIdentity.abi as AbiItem[])
  const accounts = await web3.eth.getAccounts()
  const ssiContractInstance = await ssiContract.deploy({
    data: SelfSovereignIdentity.bytecode,
    arguments: []
  }).send({
    from: accounts[0],
    gas: 3000000,
    gasPrice: '30000000000000'
  })

  console.log('SelfSovereignIdentity deployed to:', ssiContractInstance.options.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
