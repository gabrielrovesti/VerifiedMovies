import { ethers } from 'ethers'
import * as fs from 'fs'

const USER_ARTIFACTS_PATH = 'artifacts/contracts/UserRegistration.sol/UserRegistration.json'
const SSI_ARTIFACTS_PATH = 'artifacts/contracts/SelfSovereignIdentity.sol/SelfSovereignIdentity.json'

async function main () {
  const provider = new ethers.providers.JsonRpcProvider()
  const signer = provider.getSigner()

  // Load the contract artifact files
  const userRegistrationArtifact = JSON.parse(
    fs.readFileSync(USER_ARTIFACTS_PATH, 'utf8')
  )

  // Get the ABI and bytecode from the artifact
  const userRegistrationAbi = userRegistrationArtifact.abi
  const userRegistrationBytecode = userRegistrationArtifact.bytecode

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

  // Deploy the UserRegistration contract, passing the ssiContract's address as an argument
  const userRegistrationFactory = new ethers.ContractFactory(
    userRegistrationAbi,
    userRegistrationBytecode,
    signer
  )
  const userRegistrationContract = await userRegistrationFactory.deploy(
    ssiContract.address
  )
  await userRegistrationContract.deployed()

  console.log(
    'UserRegistration deployed to:',
    userRegistrationContract.address
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
