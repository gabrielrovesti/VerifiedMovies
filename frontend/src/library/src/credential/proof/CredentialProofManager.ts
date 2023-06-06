import {LanguageMap} from "jsonld/jsonld";
import {VerifiableCredential, Credential} from "../VerifiableCredential";
import {Proof} from "./Proof";

export interface CredentialProofManager<P extends Proof, C, V> {
    createProof<T extends LanguageMap>(
        credentialData: Credential<T>,
        creationOptions: C
    ): Promise<P>;

    verifyProof<T extends LanguageMap>(
        verifiableCredential: VerifiableCredential<T, P>,
        verificationOptions: V
    ): Promise<boolean>;
}
