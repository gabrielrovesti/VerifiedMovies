/* eslint-disable @typescript-eslint/no-unused-vars */
import {LanguageMap} from "jsonld/jsonld";
import {Presentation, VerifiablePresentation} from "../VerifiablePresentation";
import {Proof} from "./Proof";

export interface PresentationProofManager<P extends Proof, C, V> {
    createProof<T extends LanguageMap>(
        presentationData: Presentation,
        creationOptions: C
    ): Promise<P>;

    verifyProof<T extends LanguageMap>(
        verifiablePresentation: VerifiablePresentation<P>,
        verificationOptions: V
    ): Promise<boolean>;
}
