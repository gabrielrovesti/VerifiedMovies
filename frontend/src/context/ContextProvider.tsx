import React, { useState } from "react";
import Context from "./Context";

interface Props {
  children: React.ReactNode;
  contractAddress: string | null;
  setContractAddress: (address: string) => void;
  otherData: any;
  setOtherData: (data: any) => void;
}

const ContextProvider = ({ children, contractAddress, setContractAddress, otherData, setOtherData }: Props) => {
  const [stateContractAddress, setStateContractAddress] = useState<string | null>(contractAddress);

  const handleSetContractAddress = (address: string) => {
    setStateContractAddress(address);
    setContractAddress(address);
  };

  return (
    <Context.Provider
      value={{
        wallet: null,
        privateKey: null,
        currentContract: null,
        contractConfig: null,
        provider: null,
        contractAddress: stateContractAddress,
        handleSetContractAddress: handleSetContractAddress, // usiamo la funzione all'interno del valore del contesto
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;