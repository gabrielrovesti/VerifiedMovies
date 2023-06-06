import {Proof} from "./Proof";

export type ProofPurpose = "authentication" | "assertionMethod" | string;

export interface DataIntegrityProof extends Proof {
    created: string;
    verificationMethod: string;
    proofPurpose: ProofPurpose;
    domain?: string;
    challenge?: string;
}
