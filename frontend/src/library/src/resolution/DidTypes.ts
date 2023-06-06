import {EcdsaSecp256k1Proof} from "../credential/proof/ecdsa-secp256k1/EcdsaSecp256k1Proof";
import {JsonLdContexts, WithContext} from "../utils/JsonLdTypes";

export interface DidUrl {
    did: string;
    query: URLSearchParams;
    fragment: string;
}

export interface Service {
    id: string;
    type: string | string[];
    serviceEndpoint: string | object | string[] | object[];
    [key: string]: any;
}

export interface DidDocument {
    "@context": JsonLdContexts;
    id: string;
    authentication: VerificationMethod[];
    assertionMethod?: VerificationMethod[];
    service?: Service[];
}

export interface VerificationMethod {
    id: string;
    type: "EcdsaSecp256k1RecoveryMethod2020";
    controller: string;
    blockchainAccountId: string;
}

export type ServiceContructor = (id: string, serviceType: string, endpoint: string) => WithContext<Service>;

export interface ResolutionOptions {
    accept: "application/did+ld+json" | string;
    additionalContexts?: JsonLdContexts;
    serviceConstructor?: ServiceContructor;
}

export type DereferenceOptions = ResolutionOptions;

export type Errors =
    | "notFound"
    | "representationNotSupported"
    | "methodNotSupported"
    | "internalError";

export type DidResolutionResult = ErrorResolutionResult | SuccessfulResolutionResult;

export interface SuccessfulResolutionResult {
    "@context": ["https://w3id.org/did-resolution/v1", ...string[]];
    didResolutionMetadata: SuccessfulMetadata;
    didDocumentStream: DidDocument;
    didDocumentMetadata: DidDocumentMetadata;
}

export interface ErrorResolutionResult {
    "@context": ["https://w3id.org/did-resolution/v1", ...string[]];
    didResolutionMetadata: ErrorMetadata<"invalidDid">;
    didDocumentStream: {};
    didDocumentMetadata: {};
}

export interface DidDocumentMetadata {
    created: string;
    updated: string;
    deactivated: boolean;
}

export type DidUrlDereferenceResult = ErrorDereferenceResult | SuccessfulDereferenceResult;

export type SuccessfulDereferenceResult =
    | DereferenceResult<WithContext<VerificationMethod>, ContentMetadata<ResourceType.AUTHENTICATION>>
    | DereferenceResult<WithContext<VerificationMethod>, ContentMetadata<ResourceType.ASSERTION_METHOD>>
    | DereferenceResult<WithContext<Service>, ContentMetadata<ResourceType.SERVICE>>
    | DereferenceResult<WithContext<RevocationStatus>, ContentMetadata<ResourceType.CREDENTIAL_STATUS>>
    | DereferenceResult<DidDocument, DidDocumentMetadata>;

/*export interface SuccessfulDidDocumentResolution {
    "@context": "https://w3id.org/did-resolution/v1";
    dereferencingMetadata: SuccessfulMetadata;
    contentStream: DidDocument;
    contentMetadata: DidDocumentMetadata
}*/

/*

// dereferencingMetadata: As others
// contentStream: JSON-LD DID document
// contentMetadata: didDocumentMetadata

 */

// (dereferencingMetadata, contentStream, contentMetadata)
// dereferencingMetadata:
//  contentType?: ....,
//   error?: invalidDidUrl | notFound
// contentStream: JSON-LD object
// contentMetadata: any because it is not a DID document

export interface DereferenceResult<T, M> {
    "@context": "https://w3id.org/did-resolution/v1" & string[];
    dereferencingMetadata: SuccessfulMetadata;
    contentStream: T;
    contentMetadata: M;
}

export interface ErrorDereferenceResult {
    "@context": ["https://w3id.org/did-resolution/v1", ...string[]];
    dereferencingMetadata: ErrorMetadata<"invalidDidUrl">;
    contentStream: {};
    contentMetadata: {};
}

export interface SuccessfulMetadata {
    contentType: "application/did+ld+json";
}

export interface ErrorMetadata<T extends string> {
    error: T | Errors;
    errorMessage: string;
}

export interface ContentMetadata<R extends ResourceType> {
    resourceType: R;
}

export interface RevocationStatus {
    revoked: boolean;
}

export enum TrustCertificationStatus {
    VALID,
    DEACTIVATED,
    REVOKED
}

export interface TrustCertificationChain {

    "@context": JsonLdContexts,
    trustChain: TrustCertification[]
}

export interface TrustCertification {
    issuer: string;
    issuanceDate: Date;
    expirationDate: Date;
    certificationStatus: TrustCertificationStatus;
    credentialStatus: string;
    proof: EcdsaSecp256k1Proof;
}

export enum ResourceType {
    AUTHENTICATION,
    ASSERTION_METHOD,
    SERVICE,
    CREDENTIAL_STATUS
}
