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
