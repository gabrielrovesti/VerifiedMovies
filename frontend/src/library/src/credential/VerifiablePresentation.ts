
import {JsonLdContexts} from "../utils/JsonLdTypes";
import {Proof} from "./proof/Proof";
import {VerifiableCredential} from "./VerifiableCredential";

export interface VerifiablePresentation<P extends Proof> {
    "@context": JsonLdContexts;
    id?: string;
    type: string[];
    verifiableCredential?: VerifiableCredential<any, any> | VerifiableCredential<any, any>[];
    holder?: string;
    proof: P;
}

export type Presentation = Omit<VerifiablePresentation<any>, "proof">;
