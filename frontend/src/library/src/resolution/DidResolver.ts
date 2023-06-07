import BN from "bn.js";
import {AbiItem, PromiEvent, TransactionReceipt} from "ethereum-abi-types-generator";
import {ContextDefinition, LanguageMap} from "jsonld/jsonld";
import Web3 from "web3";
import {Account} from "web3-core";
import {CertificationCredentialRequest,ChainOfTrustDidSsi,ContractContext,MethodReturnContext,ProofRequest,SendOptions,VerificationmethodResponse} from "../../types/ChainOfTrustDidSsi";
import {EcdsaSecp256k1Proof} from "../credential/proof/ecdsa-secp256k1/EcdsaSecp256k1Proof";
import {EcdsaSecp256k1CreationOptions,EcdsaSecp256k1ProofManager,EcdsaSecp256k1VerificationOptions} from "../credential/proof/ecdsa-secp256k1/EcdsaSecp256k1ProofManager";
import {CredentialStatus, VerifiableCredential} from "../credential/VerifiableCredential";
import {VerifiableCredentialManager} from "../credential/VerifiableCredentialManager";
import {DateUtils} from "../utils/DateUtils";
import {InvalidArgumentError} from "../utils/InvalidArgumentError";
import {ContextLoader, JsonContextLoader} from "../utils/JsonContextLoaders";
import {WithContext} from "../utils/JsonLdTypes";
import {ContentMetadata,DereferenceOptions,DereferenceResult,DidDocument,DidDocumentMetadata,DidResolutionResult,DidUrl,DidUrlDereferenceResult,ErrorDereferenceResult,
        ErrorResolutionResult,Errors,ResolutionOptions,ResourceType,RevocationStatus,Service,
        ServiceContructor,SuccessfulMetadata,TrustCertification,TrustCertificationChain,TrustCertificationStatus,VerificationMethod} from "./DidTypes";
import {DidUtils} from "./DidUtils";
import {InvalidTrustCertification} from "./InvalidTrustCertification";

enum VerificationMethodType {
    AUTHENTICATION,
    ASSERTION_METHOD
}

export interface TrustCredentialSubject extends LanguageMap {
    id: string;
}

export type TrustCredential = Required<
    Omit<VerifiableCredential<TrustCredentialSubject, EcdsaSecp256k1Proof>, "id">
>;

export type TrustCredentialManager = VerifiableCredentialManager<
    EcdsaSecp256k1Proof,
    EcdsaSecp256k1CreationOptions,
    EcdsaSecp256k1VerificationOptions,
    EcdsaSecp256k1ProofManager
>;

export interface DidContainer {
    did: string;
    address: string;
    privateKey: Buffer;
}

export class DidResolver {
    private static readonly DID_DOCUMENT_CONTEXT = "https://www.w3.org/ns/did/v1";
    private static readonly ECDSA_SECP256K1_RECOVERY_2020_CONTEXT =
        "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-2.0.jsonld";
    private static readonly SSI_COT_DID_DOCUMENT_CONTEXT = "https://www.ssicot.com/did-document";
    private static readonly SSI_COT_CHAIN_RESOLUTION_CONTEXT =
        "https://www.ssicot.com/chain-resolution";
    private static readonly REVOCATION_LIST_2023_CONTEXT =
        "https://www.ssicot.com/RevocationList2023/";
    private static readonly RESOLUTION_CONTEXT = "https://w3id.org/did-resolution/v1";
    private static readonly RESOLUTION_ERROR_MESSAGE_CONTEXT =
        "https://www.ssicot.com/did-resolution#";

    private web3: Web3;
    private contract: ChainOfTrustDidSsi;
    private readonly gasLimit: number | undefined;
    private trustCredentialManager: TrustCredentialManager;
    private chainId: number;

    constructor(web3: Web3, contractAbi: AbiItem[], contractAddress: string, gasLimit?: number) {
        this.web3 = web3;
        this.contract = (
            new web3.eth.Contract(contractAbi, contractAddress) as unknown as ContractContext
        ).methods;
        this.gasLimit = gasLimit;
        this.trustCredentialManager = new VerifiableCredentialManager(
            this.web3,
            this,
            new EcdsaSecp256k1ProofManager(this.web3, this)
        );
        this.chainId = 0;
    }

    public async createNewDid(entropy: string): Promise<{
        privateKey: any;
        address: string;
        did: string;
        account: Account;
    }> {
        const creationResult = this.web3.eth.accounts.create(entropy);

        return this.createNewDidFromAccount(creationResult);
    }

    public async createNewDidFromAccount(account: Account): Promise<{
        privateKey: any;
        address: string;
        did: string;
        account: Account;
    }> {
        const did = `did:ssi-cot-eth:${await this.getChainId()}:${account.address
            .slice(2)
            .toLowerCase()}`;

        return {
            did,
            address: account.address,
            privateKey: Buffer.from(account.privateKey.slice(2), "hex"),
            account
        };
    }

    public async updateTrustCertification(
        trustCredential: TrustCredential,
        userAuthenticationMethod: string,
        trustedCredentialIssuers: Set<string>,
        loader: JsonContextLoader,
        account: string,
        gasLimit?: number
    ): Promise<PromiEvent<TransactionReceipt>> {
        // Check the validity
        await this.trustCredentialManager.verifyCredential(
            {
                verifiableCredential: trustCredential,
                trustedIssuers: trustedCredentialIssuers
            },
            {
                chainId: await this.getChainId(),
                expectedProofPurpose: "assertionMethod",
                documentLoader: loader.concatenateLoaders([
                    ContextLoader.CERTIFICATION_CREDENTIAL_LOADER,
                    ContextLoader.REVOCATION_LIST_LOADER
                ])
            }
        );

        const userAuth = await this.parseDidUrl(userAuthenticationMethod);
        if (userAuth.did !== trustCredential.credentialSubject.id) {
            throw new InvalidTrustCertification(
                "The trust certification has not been issued to the specified user"
            );
        }

        if (!this.authenticateUser(userAuth.did, account)) {
            throw new InvalidArgumentError(
                "The specified user account cannot modify the specified DID"
            );
        }

        const signature = Buffer.from(trustCredential.proof.jws.split(".")[2] || "", "base64url");
        const proof: ProofRequest = {
            issuerAssertionMethodFragment: (
                await this.parseDidUrl(trustCredential.proof.verificationMethod)
            ).fragment,
            createdTimestamp: this.isoDateToSolidityTimestamp(trustCredential.proof.created),
            jwsSignatureR: this.web3.utils.bytesToHex(Array.from(signature.subarray(0, 32))),
            jwsSignatureS: this.web3.utils.bytesToHex(Array.from(signature.subarray(32, 64))),
            jwsSignatureV: signature[64] || 0
        };

        const certificationCredential: CertificationCredentialRequest = {
            issuer: trustCredential.issuer,
            issuanceTimestamp: this.isoDateToSolidityTimestamp(trustCredential.issuanceDate),
            expirationTimestamp: this.isoDateToSolidityTimestamp(trustCredential.expirationDate),
            credentialStatusFragment: (await this.parseDidUrl(trustCredential.credentialStatus.id))
                .fragment,
            proof
        };
        return this.sendTransaction(
            this.contract.updateTrustCertification(
                userAuth.did,
                userAuth.fragment,
                certificationCredential
            ),
            account,
            gasLimit
        );
    }

    public async removeTrustCertification(
        did: string,
        userAuthenticationMethod: string,
        account: string,
        gasLimit?: number
    ): Promise<PromiEvent<TransactionReceipt>> {
        const userAuth = await this.parseDidUrl(userAuthenticationMethod);

        return this.sendTransaction(
            this.contract.removeTrustCertification(userAuth.did, userAuth.fragment),
            account,
            gasLimit
        );
    }

    public async addAuthentication(
        authMethodToAdd: string,
        address: string,
        userAuthenticationMethod: string,
        account: string,
        gasLimit?: number
    ): Promise<PromiEvent<TransactionReceipt>> {
        const userAuth = await this.parseDidUrl(userAuthenticationMethod);
        const authMethod = await this.parseDidUrl(authMethodToAdd);

        if (userAuth.did !== authMethod.did) {
            throw new InvalidArgumentError("Cannot add an authentication method to another user");
        }

        return this.sendTransaction(
            this.contract.addVerificationMethod(
                userAuth.did,
                userAuth.fragment,
                VerificationMethodType.AUTHENTICATION,
                authMethod.fragment,
                address
            ),
            account,
            gasLimit
        );
    }

    public async addAssertionMethod(
        assertionMethodDidUrl: string,
        address: string,
        userAuthenticationMethod: string,
        account: string,
        gasLimit?: number
    ): Promise<PromiEvent<TransactionReceipt>> {
        const userAuth = await this.parseDidUrl(userAuthenticationMethod);
        const assertMethod = await this.parseDidUrl(assertionMethodDidUrl);

        if (userAuth.did !== assertMethod.did) {
            throw new InvalidArgumentError("Cannot add an assertion method to another user");
        }
        return this.sendTransaction(
            this.contract.addVerificationMethod(
                userAuth.did,
                userAuth.fragment,
                VerificationMethodType.ASSERTION_METHOD,
                assertMethod.fragment,
                address
            ),
            account,
            gasLimit
        );
    }

    public async addService(
        serviceDidUrl: string,
        serviceType: string,
        endpoint: string,
        userAuthenticationMethod: string,
        account: string,
        gasLimit?: number
    ): Promise<PromiEvent<TransactionReceipt>> {
        const userAuth = await this.parseDidUrl(userAuthenticationMethod);
        const serviceUrl = await this.parseDidUrl(serviceDidUrl);

        if (userAuth.did !== serviceUrl.did) {
            throw new InvalidArgumentError("Cannot add a service to another user");
        }

        return this.sendTransaction(
            this.contract.addService(
                userAuth.did,
                userAuth.fragment,
                serviceUrl.fragment,
                serviceType,
                endpoint
            ),
            account,
            gasLimit
        );
    }

    public async updateAuthentication(
        authenticationDidUrl: string,
        userAuthenticationMethod: string,
        address: string,
        account: string,
        gasLimit?: number
    ): Promise<PromiEvent<TransactionReceipt>> {
        const userAuth = await this.parseDidUrl(userAuthenticationMethod);
        const authMethod = await this.parseDidUrl(authenticationDidUrl);

        if (userAuth.did !== authMethod.did) {
            throw new InvalidArgumentError("Cannot update an authentication of another user");
        }

        return this.sendTransaction(
            this.contract.updateVerificationMethod(
                userAuth.did,
                userAuth.fragment,
                authMethod.fragment,
                VerificationMethodType.AUTHENTICATION,
                address
            ),
            account,
            gasLimit
        );
    }

    public async updateAssertionMethod(
        assertionMethodDidUrl: string,
        userAuthenticationMethod: string,
        address: string,
        account: string,
        gasLimit?: number
    ): Promise<PromiEvent<TransactionReceipt>> {
        const userAuth = await this.parseDidUrl(userAuthenticationMethod);
        const assertMethod = await this.parseDidUrl(assertionMethodDidUrl);

        if (userAuth.did !== assertMethod.did) {
            throw new InvalidArgumentError("Cannot update an assertion method of another user");
        }

        return this.sendTransaction(
            this.contract.updateVerificationMethod(
                userAuth.did,
                userAuth.fragment,
                assertMethod.fragment,
                VerificationMethodType.ASSERTION_METHOD,
                address
            ),
            account,
            gasLimit
        );
    }

    public async updateService(
        serviceDidUrl: string,
        userAuthenticationMethod: string,
        serviceType: string,
        endpoint: string,
        account: string,
        gasLimit?: number
    ): Promise<PromiEvent<TransactionReceipt>> {
        const userAuth = await this.parseDidUrl(userAuthenticationMethod);
        const serviceUrl = await this.parseDidUrl(serviceDidUrl);

        if (userAuth.did !== serviceUrl.did) {
            throw new InvalidArgumentError("Cannot update a service of another user");
        }

        return this.sendTransaction(
            this.contract.updateService(
                userAuth.did,
                userAuth.fragment,
                serviceUrl.fragment,
                serviceType,
                endpoint
            ),
            account,
            gasLimit
        );
    }

    public async removeAuthentication(
        authenticationDidUrl: string,
        userAuthenticationMethod: string,
        account: string,
        gasLimit?: number
    ): Promise<PromiEvent<TransactionReceipt>> {
        const userAuth = await this.parseDidUrl(userAuthenticationMethod);
        const authMethod = await this.parseDidUrl(authenticationDidUrl);

        if (userAuth.did !== authMethod.did) {
            throw new InvalidArgumentError("Cannot remove an authentication of another user");
        }

        return this.sendTransaction(
            this.contract.removeVerificationMethod(
                userAuth.did,
                userAuth.fragment,
                authMethod.fragment,
                VerificationMethodType.AUTHENTICATION
            ),
            account,
            gasLimit
        );
    }

    public async removeAssertionMethod(
        assertionMethodDidUrl: string,
        userAuthenticationMethod: string,
        account: string,
        gasLimit?: number
    ): Promise<PromiEvent<TransactionReceipt>> {
        const userAuth = await this.parseDidUrl(userAuthenticationMethod);
        const assertMethod = await this.parseDidUrl(assertionMethodDidUrl);

        if (userAuth.did !== assertMethod.did) {
            throw new InvalidArgumentError("Cannot remove an assertion method of another user");
        }

        return this.sendTransaction(
            this.contract.removeVerificationMethod(
                userAuth.did,
                userAuth.fragment,
                assertMethod.fragment,
                VerificationMethodType.AUTHENTICATION
            ),
            account,
            gasLimit
        );
    }

    public async removeService(
        serviceDidUrl: string,
        userAuthenticationMethod: string,
        account: string,
        gasLimit?: number
    ): Promise<PromiEvent<TransactionReceipt>> {
        const userAuth = await this.parseDidUrl(userAuthenticationMethod);
        const serviceUrl = await this.parseDidUrl(serviceDidUrl);

        if (userAuth.did !== serviceUrl.did) {
            throw new InvalidArgumentError("Cannot remove a service of another user");
        }

        return this.sendTransaction(
            this.contract.removeService(userAuth.did, userAuth.fragment, serviceUrl.fragment),
            account,
            gasLimit
        );
    }

    public async revokeVerifiableCredential(
        credentialStatus: CredentialStatus,
        userAuthenticationMethod: string,
        account: string,
        gasLimit?: number
    ): Promise<PromiEvent<TransactionReceipt>> {
        const userAuth = await this.parseDidUrl(userAuthenticationMethod);
        const credentialStatusUrl = await this.parseDidUrl(credentialStatus.id);

        if (credentialStatus.type !== "RevocationList2023") {
            throw new InvalidArgumentError(
                "Only 'RevocationList2023' credential status is supported"
            );
        }
        if (userAuth.did !== credentialStatusUrl.did) {
            throw new InvalidArgumentError(
                "Cannot revoke a verifiable credential issued by another user"
            );
        }

        return this.sendTransaction(
            this.contract.revokeVerifiableCredential(
                userAuth.did,
                userAuth.fragment,
                credentialStatusUrl.fragment
            ),
            account,
            gasLimit
        );
    }

    public async deactivate(
        userAuthenticationMethod: string,
        account: string,
        gasLimit?: number
    ): Promise<PromiEvent<TransactionReceipt>> {
        const userAuth = await this.parseDidUrl(userAuthenticationMethod);

        return this.sendTransaction(
            this.contract.deactivate(userAuth.did, userAuth.fragment),
            account,
            gasLimit
        );
    }

    public async resolveRepresentation(
        did: string,
        resolutionOptions: ResolutionOptions
    ): Promise<DidResolutionResult> {
        const response = await this.contract.resolve(did).call();
        if (!response.valid) {
            const result: ErrorResolutionResult = {
                "@context": [
                    "https://w3id.org/did-resolution/v1",
                    DidResolver.DID_DOCUMENT_CONTEXT
                ],
                didResolutionMetadata: {error: "notFound", errorMessage: "Not found"},
                didDocumentStream: {},
                didDocumentMetadata: {}
            };
            return result;
        }
        const didResolutionMetadata: SuccessfulMetadata = {
            contentType: "application/did+ld+json"
        };
        const didDocumentMetadata: DidDocumentMetadata = {
            created: this.solidityTimestampToIsoDate(response.createdTimestamp),
            updated: this.solidityTimestampToIsoDate(response.updatedTimestamp),
            deactivated: response.deactivated
        };

        const authentications: VerificationMethod[] = [];
        const assertionMethods: VerificationMethod[] = [];

        for (const verificationMethodResponse of response.verificationMethods) {
            const verificationMethod = await this.composeVerificationMethod(
                did,
                verificationMethodResponse
            );
            if (verificationMethodResponse.methodType === "0") {
                authentications.push(verificationMethod);
            } else {
                assertionMethods.push(verificationMethod);
            }
        }

        const services: Service[] = [];
        const contexts = new Set<string | ContextDefinition>();
        const serviceResponse = response.services;
        if (serviceResponse.length > 0) {
            const serviceConstructor = resolutionOptions.serviceConstructor;
            if (serviceConstructor === undefined) {
                throw new InvalidArgumentError(
                    "The DID document contains services, but resolutionOptions.serviceConstructor is undefined"
                );
            }
            for (const service of serviceResponse) {
                const serviceWithContext = serviceConstructor(
                    `${did}#${service.didUrlFragment}`,
                    service.serviceType,
                    service.endpoint
                );
                serviceWithContext["@context"].forEach((context) => contexts.add(context));
                const serviceWithoutContext = serviceWithContext as Service & {"@context"?: any};
                delete serviceWithoutContext["@context"];
                services.push(serviceWithoutContext);
            }
        }

        contexts.delete(DidResolver.DID_DOCUMENT_CONTEXT);
        contexts.delete(DidResolver.ECDSA_SECP256K1_RECOVERY_2020_CONTEXT);
        contexts.delete(DidResolver.SSI_COT_DID_DOCUMENT_CONTEXT);

        const contextArray = Array.from(contexts);
        contextArray.unshift(
            DidResolver.DID_DOCUMENT_CONTEXT,
            DidResolver.ECDSA_SECP256K1_RECOVERY_2020_CONTEXT,
            DidResolver.SSI_COT_DID_DOCUMENT_CONTEXT
        );

        const document: DidDocument = {
            "@context": contextArray,
            id: did,
            authentication: authentications
        };
        if (assertionMethods.length !== 0) {
            document.assertionMethod = assertionMethods;
        }
        if (services.length !== 0) {
            document.service = services;
        }

        return {
            "@context": [DidResolver.RESOLUTION_CONTEXT],
            didResolutionMetadata,
            didDocumentStream: document,
            didDocumentMetadata
        };
    }

    public async resolveChain(did: string): Promise<TrustCertificationChain> {
        const response = await this.contract.resolveChain(did).call();
        const result: TrustCertification[] = [];

        for (let i = 0; i < response.certifications.length; i++) {
            const certification = response.certifications[i];
            const credentialStatus = response.statuses[i];
            if (
                certification === undefined ||
                credentialStatus === undefined ||
                !certification.valid
            ) {
                break;
            }
            const proof = certification.proof;

            const signatureBytes: number[] = [];
            signatureBytes.push(...this.web3.utils.hexToBytes(proof.jwsSignatureR));
            signatureBytes.push(...this.web3.utils.hexToBytes(proof.jwsSignatureS));
            signatureBytes.push(new BN(proof.jwsSignatureV).toNumber());
            const jwsSignature = Buffer.from(signatureBytes).toString("base64url");

            let status: TrustCertificationStatus;
            if (credentialStatus === "0") {
                status = TrustCertificationStatus.VALID;
            } else if (credentialStatus === "1") {
                status = TrustCertificationStatus.DEACTIVATED;
            } else {
                status = TrustCertificationStatus.REVOKED;
            }

            const trustCertification: TrustCertification = {
                issuer: certification.issuer,
                issuanceDate: this.solidityTimestampToDate(certification.issuanceTimestamp),
                expirationDate: this.solidityTimestampToDate(certification.expirationTimestamp),
                credentialStatus: `${certification.issuer}#${certification.credentialStatusFragment}`,
                certificationStatus: status,
                //  element.certificationStatus,
                proof: {
                    type: "EcdsaSecp256k1RecoverySignature2020",
                    created: DateUtils.toIsoDate(
                        this.solidityTimestampToDate(proof.createdTimestamp)
                    ),
                    verificationMethod: `${certification.issuer}#${proof.issuerAssertionMethodFragment}`,
                    proofPurpose: "assertionMethod",
                    jws: `eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..${jwsSignature}`
                }
            };
            result.push(trustCertification);
        }
        return {
            "@context": [
                DidResolver.SSI_COT_DID_DOCUMENT_CONTEXT,
                DidResolver.SSI_COT_CHAIN_RESOLUTION_CONTEXT,
                DidResolver.ECDSA_SECP256K1_RECOVERY_2020_CONTEXT
            ],
            trustChain: result
        };
    }

    public async resolveDidUrl(
        didUrl: string,
        dereferenceOptions: DereferenceOptions = {accept: "application/did+ld+json"}
    ): Promise<DidUrlDereferenceResult> {
        if (dereferenceOptions.accept !== "application/did+ld+json") {
            throw new InvalidArgumentError(`Unknown accept type '${dereferenceOptions.accept}'`);
        }
        // Parse the DID URL
        const parsedDidUrl = DidUtils.parseDidUrl(didUrl, await this.getChainId());

        const queryParamsCount = parsedDidUrl.query.size;
        const fragmentLength = parsedDidUrl.fragment.length;

        if (queryParamsCount > 1) {
            return DidResolver.composeErrorResult(
                "invalidDidUrl",
                "The DID URL to resolve must contain at most 1 query parameter"
            );
        }
        if (queryParamsCount === 1 && fragmentLength !== 0) {
            return DidResolver.composeErrorResult(
                "invalidDidUrl",
                "The DID URL to resolve must specify either the query part or the fragment part, but not both"
            );
        }

        if (queryParamsCount === 0 && fragmentLength === 0) {
            // Resolve the DID document
            const didResolutionResult = await this.resolveRepresentation(
                didUrl,
                dereferenceOptions
            );

            if (DidUtils.isResolutionErrored(didResolutionResult)) {
                let error = didResolutionResult.didResolutionMetadata.error;
                let errorString: "invalidDidUrl" | Errors;

                if (error === "invalidDid") {
                    errorString = "invalidDidUrl";
                } else {
                    errorString = error;
                }
                return {
                    "@context": [
                        DidResolver.RESOLUTION_CONTEXT,
                        DidResolver.RESOLUTION_ERROR_MESSAGE_CONTEXT
                    ],
                    dereferencingMetadata: {error: errorString, errorMessage: "Resolution error"},
                    contentStream: {},
                    contentMetadata: {}
                } as ErrorDereferenceResult;
            }
            return {
                "@context": [
                    DidResolver.RESOLUTION_CONTEXT,
                    DidResolver.RESOLUTION_ERROR_MESSAGE_CONTEXT
                ],
                dereferencingMetadata: {contentType: "application/did+ld+json"},
                contentStream: didResolutionResult.didDocumentStream,
                contentMetadata: didResolutionResult.didDocumentMetadata
            } as DereferenceResult<DidDocument, DidDocumentMetadata>;
        }
        if (queryParamsCount === 1) {
            return this.resolveService(parsedDidUrl, dereferenceOptions.serviceConstructor);
        }
        // Try resolving as a verification method
        const verificationMethodResult = await this.resolveVerificationMethod(parsedDidUrl);
        if (DidUtils.isErrored(verificationMethodResult)) {
            return this.resolveCredentialStatus(parsedDidUrl);
        }
        return verificationMethodResult;
    }

    private async resolveVerificationMethod(parsedDidUrl: DidUrl) {
        let resourceType: ResourceType.AUTHENTICATION | ResourceType.ASSERTION_METHOD;

        const verificationMethod = await this.contract
            .resolveVerificationMethod(parsedDidUrl.did, parsedDidUrl.fragment)
            .call();
        if (!verificationMethod.valid) {
            return DidResolver.composeErrorResult(
                "notFound",
                `The resource ${parsedDidUrl.did}#${parsedDidUrl.fragment} has not been found`
            );
        }

        if (verificationMethod.methodType === "0") {
            resourceType = ResourceType.AUTHENTICATION;
        } else {
            resourceType = ResourceType.ASSERTION_METHOD;
        }
        return {
            "@context": [
                DidResolver.RESOLUTION_CONTEXT,
                DidResolver.RESOLUTION_ERROR_MESSAGE_CONTEXT
            ],
            dereferencingMetadata: {contentType: "application/did+ld+json"},
            contentStream: await this.composeVerificationMethodWithContext(
                parsedDidUrl.did,
                verificationMethod
            ),
            contentMetadata: {resourceType}
        } as
            | DereferenceResult<
                  WithContext<VerificationMethod>,
                  ContentMetadata<ResourceType.AUTHENTICATION>
              >
            | DereferenceResult<
                  WithContext<VerificationMethod>,
                  ContentMetadata<ResourceType.ASSERTION_METHOD>
              >;
    }

    private async resolveCredentialStatus(parsedDidUrl: DidUrl) {
        const revoked = await this.contract
            .resolveCredentialStatus(parsedDidUrl.did, parsedDidUrl.fragment)
            .call();

        const status: WithContext<RevocationStatus> = {
            "@context": [DidResolver.REVOCATION_LIST_2023_CONTEXT],
            revoked
        };
        return {
            "@context": DidResolver.RESOLUTION_CONTEXT,
            dereferencingMetadata: {contentType: "application/did+ld+json"},
            contentStream: status,
            contentMetadata: {resourceType: ResourceType.CREDENTIAL_STATUS}
        } as DereferenceResult<
            WithContext<RevocationStatus>,
            ContentMetadata<ResourceType.CREDENTIAL_STATUS>
        >;
    }

    private async resolveService(parsedDidUrl: DidUrl, serviceConstructor?: ServiceContructor) {
        const serviceName = parsedDidUrl.query.get("service");

        if (serviceName === null) {
            return DidResolver.composeErrorResult(
                "invalidDidUrl",
                "The only supported DID URL query param is 'service'"
            );
        }
        if (serviceConstructor === undefined) {
            throw new InvalidArgumentError(
                "The DID URL resolves to a service, but dereferenceOptions.serviceConstructor is undefined"
            );
        }
        const serviceResponse = await this.contract
            .resolveService(parsedDidUrl.did, serviceName)
            .call();
        if (!serviceResponse.valid) {
            return DidResolver.composeErrorResult("notFound", "Service not found");
        }
        const service = serviceConstructor(
            `${parsedDidUrl.did}#${serviceResponse.didUrlFragment}`,
            serviceResponse.serviceType,
            serviceResponse.endpoint
        );
        service["@context"].unshift(DidResolver.DID_DOCUMENT_CONTEXT);

        return {
            "@context": [
                DidResolver.RESOLUTION_CONTEXT,
                DidResolver.RESOLUTION_ERROR_MESSAGE_CONTEXT
            ],
            dereferencingMetadata: {contentType: "application/did+ld+json"},
            contentStream: service,
            contentMetadata: {resourceType: ResourceType.SERVICE}
        } as DereferenceResult<WithContext<Service>, ContentMetadata<ResourceType.SERVICE>>;
    }

    public async clear(account?: string): Promise<PromiEvent<TransactionReceipt>> {
        return this.sendTransaction(
            this.contract.clear(),
            account || this.web3.eth.defaultAccount || ""
        );
    }

    private async sendTransaction(
        transaction: MethodReturnContext,
        account: string,
        gasLimit?: number
    ): Promise<PromiEvent<TransactionReceipt>> {
        return transaction.send(
            this.getOptions(account || this.web3.eth.defaultAccount || "", gasLimit)
        );
    }

    private isoDateToSolidityTimestamp(isoDate: string): string {
        const milliseconds = Date.parse(isoDate);
        return this.web3.utils.numberToHex(Math.floor(milliseconds / 1000));
    }

    private solidityTimestampToDate(timestamp: string | number): Date {
        return new Date(new BN(timestamp).toNumber() * 1000);
    }

    private solidityTimestampToIsoDate(timestamp: string | number): string {
        const milliseconds = new BN(timestamp);
        return DateUtils.toIsoDate(new Date(milliseconds.toNumber() * 1000));
    }

    public async getChainId(): Promise<number> {
        await this.computeChainId();
        return this.chainId;
    }

    private authenticateUser(did: string, account: string) {
        return did.slice(-40) === account.toLowerCase().slice(2);
    }

    private async computeChainId(): Promise<void> {
        if (this.chainId === 0) {
            this.chainId = await this.web3.eth.getChainId();
        }
    }

    /*private async isValidDid(did: string): Promise<boolean> {
        await this.computeChainId();
        return DidUtils.isValidDid(did, this.chainId);
    }*/

    private async parseDidUrl(didUrl: string): Promise<DidUrl> {
        return DidUtils.parseDidUrl(didUrl, await this.getChainId());
    }

    private getOptions(account: string, gasLimit?: number): SendOptions {
        const options: SendOptions = {from: account};

        if (gasLimit !== undefined) {
            options.gas = gasLimit;
        } else if (this.gasLimit !== undefined) {
            options.gas = this.gasLimit;
        }

        return options;
    }

    private async composeVerificationMethodWithContext(
        did: string,
        response: VerificationmethodResponse
    ): Promise<WithContext<VerificationMethod>> {
        const verificationMethod = (await this.composeVerificationMethod(
            did,
            response
        )) as WithContext<VerificationMethod>;
        verificationMethod["@context"] = [
            DidResolver.DID_DOCUMENT_CONTEXT,
            DidResolver.ECDSA_SECP256K1_RECOVERY_2020_CONTEXT
        ];

        return verificationMethod;
    }

    private async composeVerificationMethod(
        did: string,
        response: VerificationmethodResponse
    ): Promise<VerificationMethod> {
        return {
            id: `${did}#${response.didUrlFragment}`,
            type: "EcdsaSecp256k1RecoveryMethod2020",
            controller: did,
            blockchainAccountId: `eip155:${await this.getChainId()}:${response.blockchainAccount.slice(
                2
            )}`
        };
    }

    private static composeErrorResult(
        error: "invalidDidUrl" | Errors,
        errorMessage: string
    ): ErrorDereferenceResult {
        return {
            "@context": [
                DidResolver.RESOLUTION_CONTEXT,
                DidResolver.RESOLUTION_ERROR_MESSAGE_CONTEXT
            ],
            dereferencingMetadata: {error, errorMessage},
            contentStream: {},
            contentMetadata: {}
        };
    }
}
