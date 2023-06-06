import BN from 'bn.js';
import BigNumber from 'bignumber.js';
import {
  PromiEvent,
  TransactionReceipt,
  EventResponse,
  EventData,
  Web3ContractContext,
} from 'ethereum-abi-types-generator';

export interface CallOptions {
  from?: string;
  gasPrice?: string;
  gas?: number;
}

export interface SendOptions {
  from: string;
  value?: number | string | BN | BigNumber;
  gasPrice?: string;
  gas?: number;
}

export interface EstimateGasOptions {
  from?: string;
  value?: number | string | BN | BigNumber;
  gas?: number;
}

export interface MethodPayableReturnContext {
  send(options: SendOptions): PromiEvent<TransactionReceipt>;
  send(
    options: SendOptions,
    callback: (error: Error, result: any) => void
  ): PromiEvent<TransactionReceipt>;
  estimateGas(options: EstimateGasOptions): Promise<number>;
  estimateGas(
    options: EstimateGasOptions,
    callback: (error: Error, result: any) => void
  ): Promise<number>;
  encodeABI(): string;
}

export interface MethodConstantReturnContext<TCallReturn> {
  call(): Promise<TCallReturn>;
  call(options: CallOptions): Promise<TCallReturn>;
  call(
    options: CallOptions,
    callback: (error: Error, result: TCallReturn) => void
  ): Promise<TCallReturn>;
  encodeABI(): string;
}

export interface MethodReturnContext extends MethodPayableReturnContext {}

export type ContractContext = Web3ContractContext<
  ChainOfTrustDidSsi,
  ChainOfTrustDidSsiMethodNames,
  ChainOfTrustDidSsiEventsContext,
  ChainOfTrustDidSsiEvents
>;
export type ChainOfTrustDidSsiEvents = undefined;
export interface ChainOfTrustDidSsiEventsContext {}
export type ChainOfTrustDidSsiMethodNames =
  | 'new'
  | 'updateTrustCertification'
  | 'removeTrustCertification'
  | 'addVerificationMethod'
  | 'addService'
  | 'updateVerificationMethod'
  | 'updateService'
  | 'removeVerificationMethod'
  | 'removeService'
  | 'revokeVerifiableCredential'
  | 'deactivate'
  | 'resolve'
  | 'resolveChain'
  | 'resolveVerificationMethod'
  | 'resolveService'
  | 'resolveCredentialStatus'
  | 'clear';
export interface ProofRequest {
  jwsSignatureR: string | number[];
  jwsSignatureS: string | number[];
  jwsSignatureV: string | number;
  createdTimestamp: string;
  issuerAssertionMethodFragment: string;
}
export interface CertificationCredentialRequest {
  issuer: string;
  issuanceTimestamp: string;
  expirationTimestamp: string;
  credentialStatusFragment: string;
  proof: ProofRequest;
}
export interface VerificationMethodsResponse {
  valid: boolean;
  blockchainAccount: string;
  methodType: string;
  keyIndex: string;
  didUrlFragment: string;
}
export interface ServicesResponse {
  valid: boolean;
  keyIndex: string;
  didUrlFragment: string;
  serviceType: string;
  endpoint: string;
}
export interface ProofResponse {
  jwsSignatureR: string;
  jwsSignatureS: string;
  jwsSignatureV: string;
  createdTimestamp: string;
  issuerAssertionMethodFragment: string;
}
export interface CertificationResponse {
  valid: boolean;
  issuanceTimestamp: string;
  expirationTimestamp: string;
  issuer: string;
  credentialStatusFragment: string;
  proof: ProofResponse;
}
export interface ResolveddiddocumentResponse {
  valid: boolean;
  deactivated: boolean;
  createdTimestamp: string;
  updatedTimestamp: string;
  verificationMethods: VerificationMethodsResponse[];
  services: ServicesResponse[];
  certification: CertificationResponse;
  certificationStatus: string;
}
export interface CertificationsResponse {
  valid: boolean;
  issuanceTimestamp: string;
  expirationTimestamp: string;
  issuer: string;
  credentialStatusFragment: string;
  proof: ProofResponse;
}
export interface ResolvedtrustchainResponse {
  certifications: CertificationsResponse[];
  statuses: string[];
}
export interface VerificationmethodResponse {
  valid: boolean;
  blockchainAccount: string;
  methodType: string;
  keyIndex: string;
  didUrlFragment: string;
}
export interface ServiceResponse {
  valid: boolean;
  keyIndex: string;
  didUrlFragment: string;
  serviceType: string;
  endpoint: string;
}
export interface ChainOfTrustDidSsi {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   */
  'new'(): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param senderAuthDid Type: string, Indexed: false
   * @param senderAuthFragment Type: string, Indexed: false
   * @param certificationCredential Type: tuple, Indexed: false
   */
  updateTrustCertification(
    senderAuthDid: string,
    senderAuthFragment: string,
    certificationCredential: CertificationCredentialRequest
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param senderAuthDid Type: string, Indexed: false
   * @param senderAuthFragment Type: string, Indexed: false
   */
  removeTrustCertification(
    senderAuthDid: string,
    senderAuthFragment: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param senderAuthDid Type: string, Indexed: false
   * @param senderAuthFragment Type: string, Indexed: false
   * @param methodType Type: uint8, Indexed: false
   * @param methodDidUrlFragment Type: string, Indexed: false
   * @param blockchainAccount Type: address, Indexed: false
   */
  addVerificationMethod(
    senderAuthDid: string,
    senderAuthFragment: string,
    methodType: string | number,
    methodDidUrlFragment: string,
    blockchainAccount: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param senderAuthDid Type: string, Indexed: false
   * @param senderAuthFragment Type: string, Indexed: false
   * @param serviceDidUrlFragment Type: string, Indexed: false
   * @param serviceType Type: string, Indexed: false
   * @param endpoint Type: string, Indexed: false
   */
  addService(
    senderAuthDid: string,
    senderAuthFragment: string,
    serviceDidUrlFragment: string,
    serviceType: string,
    endpoint: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param senderAuthDid Type: string, Indexed: false
   * @param senderAuthFragment Type: string, Indexed: false
   * @param verificationMethodFragment Type: string, Indexed: false
   * @param methodType Type: uint8, Indexed: false
   * @param blockchainAccount Type: address, Indexed: false
   */
  updateVerificationMethod(
    senderAuthDid: string,
    senderAuthFragment: string,
    verificationMethodFragment: string,
    methodType: string | number,
    blockchainAccount: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param senderAuthDid Type: string, Indexed: false
   * @param senderAuthFragment Type: string, Indexed: false
   * @param serviceDidUrlFragment Type: string, Indexed: false
   * @param serviceType Type: string, Indexed: false
   * @param endpoint Type: string, Indexed: false
   */
  updateService(
    senderAuthDid: string,
    senderAuthFragment: string,
    serviceDidUrlFragment: string,
    serviceType: string,
    endpoint: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param senderAuthDid Type: string, Indexed: false
   * @param senderAuthFragment Type: string, Indexed: false
   * @param verificationMethodFragment Type: string, Indexed: false
   * @param methodType Type: uint8, Indexed: false
   */
  removeVerificationMethod(
    senderAuthDid: string,
    senderAuthFragment: string,
    verificationMethodFragment: string,
    methodType: string | number
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param senderAuthDid Type: string, Indexed: false
   * @param senderAuthFragment Type: string, Indexed: false
   * @param serviceDidUrlFragment Type: string, Indexed: false
   */
  removeService(
    senderAuthDid: string,
    senderAuthFragment: string,
    serviceDidUrlFragment: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param senderAuthDid Type: string, Indexed: false
   * @param senderAuthFragment Type: string, Indexed: false
   * @param credentialStatusFragment Type: string, Indexed: false
   */
  revokeVerifiableCredential(
    senderAuthDid: string,
    senderAuthFragment: string,
    credentialStatusFragment: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param senderAuthDid Type: string, Indexed: false
   * @param senderAuthFragment Type: string, Indexed: false
   */
  deactivate(
    senderAuthDid: string,
    senderAuthFragment: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param did Type: string, Indexed: false
   */
  resolve(
    did: string
  ): MethodConstantReturnContext<ResolveddiddocumentResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param did Type: string, Indexed: false
   */
  resolveChain(
    did: string
  ): MethodConstantReturnContext<ResolvedtrustchainResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param methodDid Type: string, Indexed: false
   * @param methodDidUrlFragment Type: string, Indexed: false
   */
  resolveVerificationMethod(
    methodDid: string,
    methodDidUrlFragment: string
  ): MethodConstantReturnContext<VerificationmethodResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param serviceDid Type: string, Indexed: false
   * @param serviceFragment Type: string, Indexed: false
   */
  resolveService(
    serviceDid: string,
    serviceFragment: string
  ): MethodConstantReturnContext<ServiceResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param credentialDid Type: string, Indexed: false
   * @param credentialFragment Type: string, Indexed: false
   */
  resolveCredentialStatus(
    credentialDid: string,
    credentialFragment: string
  ): MethodConstantReturnContext<boolean>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  clear(): MethodReturnContext;
}
