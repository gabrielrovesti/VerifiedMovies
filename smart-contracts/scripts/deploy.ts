import Web3 from 'web3'
import SelfSovereignIdentity from '../artifacts/contracts/SelfSovereignIdentity.sol/SelfSovereignIdentity.json'
import ChainOfTrustDidSsi from '../artifacts/contracts/ChainOfTrustDidSsi.sol/ChainOfTrustDidSsi.json'
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

  const ChainOfTrustDidSsiContract = new web3.eth.Contract(ChainOfTrustDidSsi.abi as AbiItem[])
  const chainOfTrustDidSsiContractInstance = await ChainOfTrustDidSsiContract.deploy({
    data: ChainOfTrustDidSsi.bytecode,
    arguments: []
  }).send({
    from: accounts[0],
    gas: 6000000,
    gasPrice: '30000000000000'
  })

  console.log('SelfSovereignIdentity deployed to:', ssiContractInstance.options.address)
  console.log('ChainOfTrustDidSsi deployed to:', chainOfTrustDidSsiContractInstance.options.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
