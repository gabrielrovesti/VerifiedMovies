import React from "react";

interface ContextProps {
  wallet: any;
  privateKey: any;
  currentContract: any;
  contractConfig: any;
  provider: any;
  contractAddress: string | null;
  handleSetContractAddress: (address: string) => void; // aggiungi la proprietà handleSetContractAddress
}

const Context = React.createContext<ContextProps>({
  wallet: null,
  privateKey: null,
  currentContract: null,
  contractConfig: null,
  provider: null,
  contractAddress: null,
  handleSetContractAddress: () => {}, // aggiungi la proprietà handleSetContractAddress
});

export default Context;