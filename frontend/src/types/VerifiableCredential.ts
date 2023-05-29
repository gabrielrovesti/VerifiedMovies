
export type Type = string | string[]

export interface ImageObject {
  id: string
  type?: Type
  [x: string]: any
}

export interface LinkedDataObject {
  id?: string
  type?: Type
  name?: string
  image?: string | ImageObject
  [x: string]: any;
}

export interface IssuerObject extends LinkedDataObject {
  id: string
  url?: string,
  publicKey?: string; 
  [x: string]: any
}

export type VerifiableCredential = VCDIVerifiableCredential | CompactJWT

export type CompactJWT = string

// Represents a Verifiable Credential protected by
// the Verifiable Credential Data Integrity 1.0 spec
// @see https://www.w3.org/TR/vc-data-integrity/

export interface VCDIVerifiableCredential extends LinkedDataObject {
  // The first element of the @context array must be the VC context itself
  // Subsequent elements are either URLs for other contexts OR
  // inline context objects.
  // https://w3c.github.io/vc-data-model/#contexts
  '@context': string[] | any

  // https://w3c.github.io/vc-data-model/#identifiers
  id?: string

  // https://w3c.github.io/vc-data-model/#types
  type: Type

  // https://w3c.github.io/vc-data-model/#issuer
  issuer: string | IssuerObject

  // https://w3c.github.io/vc-data-model/#issuance-date
  issuanceDate: string

  // https://w3c.github.io/vc-data-model/#expiration
  expirationDate?: string

  // https://w3c.github.io/vc-data-model/#credential-subject
  credentialSubject: CredentialSubject

  // https://w3c.github.io/vc-data-model/#status
  credentialStatus?: CredentialStatus

  // https://w3c.github.io/vc-data-model/#data-schemas
  credentialSchema?: CredentialSchema

  // https://w3c.github.io/vc-data-model/#evidence
  evidence?: Evidence | Evidence[]

  // https://w3c.github.io/vc-data-model/#refreshing
  refreshService?: RefreshService

  // https://w3c.github.io/vc-data-model/#terms-of-use
  termsOfUse?: any

  // For W3C Linked Data Integrity-protected VCs, a 'proof' is required
  // However, for JWT-protected VCs, 'proof' is optional (is external)
  // @see https://w3c-ccg.github.io/ld-cryptosuite-registry/
  // for examples of cryptographic suites used for VC proofs
  proof?: any

  // Implementers are free to add any other properties to a VC
  [x: string]: any
}

// https://w3c.github.io/vc-data-model/#credential-subject
export interface CredentialSubject extends LinkedDataObject {
  // Custom defined for my use case
  id: string
  age: number
  type: string
}

// https://w3c.github.io/vc-data-model/#status
export interface CredentialStatus extends LinkedDataObject {
  // id and type are required for `credentialStatus` by the VC spec
  id: string
  type: Type
  [x: string]: any

  // Each status type has its own required fields. For example:
  // https://w3c-ccg.github.io/vc-status-list-2021
  statusPurpose?: string
  statusListIndex?: string | number
  statusListCredential?: string
}

// https://w3c.github.io/vc-data-model/#data-schemas
export interface CredentialSchema {
  id: string
  type: string
}

// https://w3c.github.io/vc-data-model/#refreshing
export interface RefreshService {
  id: string
  type: string
}

// https://w3c.github.io/vc-data-model/#evidence
export interface Evidence extends LinkedDataObject {}