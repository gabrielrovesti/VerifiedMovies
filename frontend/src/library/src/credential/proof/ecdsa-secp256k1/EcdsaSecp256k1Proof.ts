import {DataIntegrityProof, ProofPurpose} from "../DataIntegrityProof";
import 'crypto-browserify';
import 'stream-http';
import 'https-browserify';
import 'os-browserify/browser';

export interface EcdsaSecp256k1Proof extends DataIntegrityProof {
    type: "EcdsaSecp256k1RecoverySignature2020";
    created: string;
    verificationMethod: string;
    proofPurpose: ProofPurpose;
    jws: string;
    domain?: string;
    challenge?: string;
}
