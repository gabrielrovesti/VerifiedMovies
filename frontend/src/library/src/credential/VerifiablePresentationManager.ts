import Web3 from "web3";
import {DidResolver} from "../resolution/DidResolver";
import {InvalidArgumentError} from "../utils/InvalidArgumentError";
import {JsonLdContexts} from "../utils/JsonLdTypes";
import {DidUtils} from "../resolution/DidUtils";
import {InvalidVerifiablePresentationError} from "./InvalidVerifiablePresentationError";
import {PresentationProofManager} from "./proof/PresentationProofManager";
import {Proof} from "./proof/Proof";
import {VerifiableCredential} from "./VerifiableCredential";
import {Presentation, VerifiablePresentation} from "./VerifiablePresentation";

export interface VerifiablePresentationOptions {
    additionalContexts: JsonLdContexts;
    id?: string;
    additionalTypes: string[];
    holder?: string;
    verifiableCredentials?: VerifiableCredential<any, any> | VerifiableCredential<any, any>[];
}

export class VerifiablePresentationManager<
    P extends Proof,
    C,
    V,
    M extends PresentationProofManager<P, C, V>
> {
    private static readonly VERIFIABLE_PRESENTATIONS_CONTEXT =
        "https://www.w3.org/2018/credentials/v1";
    private didResolver: DidResolver;
    private proofManager: M;

    constructor(web3: Web3, didResolver: DidResolver, proofManager: M) {
        this.didResolver = didResolver;
        this.proofManager = proofManager;
    }

    public async createVerifiablePresentation(
        options: VerifiablePresentationOptions,
        proofCreationOptions: C
    ) {
        // Check the arguments

        const presentation: Presentation = {
            "@context": [VerifiablePresentationManager.VERIFIABLE_PRESENTATIONS_CONTEXT],
            type: ["VerifiablePresentation"]
        };
        // Add additional contexts
        presentation["@context"].push(...options.additionalContexts);
        // Add additional types
        presentation.type.push(...options.additionalTypes);
        // Add optional fields
        if (options.id !== undefined) {
            presentation.id = options.id;
        }
        if (options.verifiableCredentials !== undefined) {
            presentation.verifiableCredential = options.verifiableCredentials;
        }
        if (options.holder !== undefined) {
            const chainId = await this.didResolver.getChainId();
            if (!DidUtils.isValidDid(options.holder, chainId)) {
                throw new InvalidArgumentError("The holder is not a valid DID");
            }
            presentation.holder = options.holder;
        }

        // Generate the proof
        const proof = await this.proofManager.createProof(presentation, proofCreationOptions);

        const credentialWithProof = presentation as VerifiablePresentation<P>;
        credentialWithProof.proof = proof;

        return credentialWithProof;
    }

    public async verifyPresentation(
        verifiablePresentation: VerifiablePresentation<P>,
        proofVerificationOptions: V
    ) {
        // Check the context
        if (
            verifiablePresentation["@context"].length === 0 ||
            verifiablePresentation["@context"][0] !==
                VerifiablePresentationManager.VERIFIABLE_PRESENTATIONS_CONTEXT
        ) {
            throw new InvalidVerifiablePresentationError(
                `Any valid verifiable presentation must specify '${VerifiablePresentationManager.VERIFIABLE_PRESENTATIONS_CONTEXT}' as the first context`
            );
        }
        // Check the type
        if (!verifiablePresentation.type.includes("VerifiablePresentation")) {
            throw new InvalidVerifiablePresentationError(
                "Any valid verifiable presentation must contain the type 'VerifiablePresentation'"
            );
        }
        // Check the holder
        if (verifiablePresentation.holder !== undefined) {
            const chainId = await this.didResolver.getChainId();
            if (!DidUtils.isValidDid(verifiablePresentation.holder, chainId)) {
                throw new InvalidArgumentError("The holder is not a valid DID");
            }
        }
        // Verify the proof
        if (
            !(await this.proofManager.verifyProof(verifiablePresentation, proofVerificationOptions))
        ) {
            throw new InvalidVerifiablePresentationError(
                "The integrity of the verifiable presentation cannot be validated"
            );
        }
    }
}
