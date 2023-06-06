import {LanguageMap} from "jsonld/jsonld";
import {JsonLdContexts} from "../utils/JsonLdTypes";
import {Proof} from "./proof/Proof";

export type CredentialStatus = {id: string; type: "RevocationList2023"};

export interface VerifiableCredential<T extends LanguageMap, P extends Proof> {
    "@context": JsonLdContexts;
    id?: string;
    type: string[];
    credentialSubject: T;
    issuer: string;
    issuanceDate: string;
    expirationDate?: string;
    credentialStatus?: CredentialStatus;
    proof: P;
}

export type Credential<T extends LanguageMap> = Omit<VerifiableCredential<T, any>, "proof">;
