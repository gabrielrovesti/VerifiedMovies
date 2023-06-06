import {createHash} from "crypto";
import Secp256k1 from "secp256k1";
import Web3 from "web3";
import {InvalidJwsError} from "./InvalidJwsError";
import 'crypto-browserify';
import 'stream-http';
import 'https-browserify';
import 'os-browserify/browser';


export interface JoseHeader {
    alg: string;
    b64: boolean;
    crit: string[];
}

export interface UnencodedDetachedPayloadJws {
    header: JoseHeader;
    encodedHeader: string;
    decodedSignature: Buffer;
}

export class JwsManager {
    private web3: Web3;

    constructor(web3: Web3) {
        this.web3 = web3;
    }

    public async encode(payload: string, privateKey: Buffer): Promise<string> {
        // Create the header
        const joseHeader: JoseHeader = {
            alg: "ES256K-R",
            b64: false,
            crit: ["b64"]
        };

        // Encode the header
        const encodedHeader = Buffer.from(JSON.stringify(joseHeader)).toString("base64url");

        // Encode the signature
        const signingInput = `${encodedHeader}.${payload}`;
        // Compute the hash
        const hashData = createHash("sha256").update(signingInput).digest();

        // Sign the massage
        const signatureResult = Secp256k1.ecdsaSign(hashData, privateKey);
        // Compute the final signature
        const signatureBytesArray = Array.from(signatureResult.signature);
        signatureBytesArray.push(signatureResult.recid + 27);

        // Create the final output
        return `${encodedHeader}..${Buffer.from(signatureBytesArray).toString("base64url")}`;
    }

    public decode(jws: string): UnencodedDetachedPayloadJws {
        // Extract the 3 portions
        const divided = jws.split(".");

        if (divided.length !== 3) {
            throw new InvalidJwsError("The specified JWS does not contain three parts");
        }
        // Extract the interesting portions
        const encodedHeader = divided[0] || "";
        const encodedSignature = divided[2] || "";
        let header: JoseHeader;
        try {
            // Decode the JOSE header
            const decodedStringHeader = Buffer.from(encodedHeader, "base64url").toString();
            header = JSON.parse(decodedStringHeader);
        } catch (e: unknown) {
            let message: string;
            // Handle parse errors
            if (e instanceof SyntaxError) {
                message = "The JWS header is not a valid JSON object";
            } else if (e instanceof TypeError) {
                message = "Invalid JWS encoding";
            } else {
                message = "Unable to decode the JWS header";
            }
            throw new InvalidJwsError(message, e);
        }
        if (typeof header !== "object") {
            throw new InvalidJwsError("The JWS header is not a JSON object");
        }
        // Check for possible duplicated Header Parameters
        const keys = Object.keys(header);
        const keysSet = new Set(keys);
        if (keys.length !== 3) {
            throw new InvalidJwsError(
                `The JWS header object must contain exactly 3 fields, but ${keys.length} ${
                    keys.length === 1 ? "is" : "are"
                } present`
            );
        }
        if (keys.length !== keysSet.size) {
            throw new InvalidJwsError("The JWS header contains duplicated keys");
        }
        // Verify the content of the JOSE header
        if (!keysSet.has("alg")) {
            throw new InvalidJwsError("The JWS header does not contain the 'alg' Header Parameter");
        }
        if (header.alg !== "ES256K-R") {
            throw new InvalidJwsError(
                `Unsupported JWS signing algorithm '${header.alg}'. Only ES256K-R is supported`
            );
        }
        if (!keysSet.has("crit")) {
            throw new InvalidJwsError(
                "The JWS header does not contain the 'crit' Header Parameter"
            );
        }
        if (header.crit.length !== 1 || header.crit[0] !== "b64") {
            throw new InvalidJwsError(
                "The 'crit' Header parameter of the JWS must contain only the value \"b64\""
            );
        }
        if (!keysSet.has("b64")) {
            throw new InvalidJwsError("The JWS header does not contain the 'b64' Header Parameter");
        }
        if (header.b64) {
            throw new InvalidJwsError("The JWS must use the detached payload option");
        }

        // Decode the signature
        const decodedSignature = Buffer.from(encodedSignature, "base64url");
        if (decodedSignature.length !== 65) {
            throw new InvalidJwsError("The JWS signature must be 65 bytes long");
        }

        return {
            header,
            encodedHeader,
            decodedSignature
        };
    }

    public verify(jws: string, payload: string, expectedSignerAccount: string): boolean {
        // Decode the JWS
        const decodedJws = this.decode(jws);

        // Create the Signing Input
        const signingInput = `${decodedJws.encodedHeader}.${payload}`;
        const messageHash = createHash("sha256").update(signingInput).digest();

        // Verify the signature
        const signatureObject = {
            messageHash: this.web3.utils.bytesToHex(Array.from(messageHash)),
            r: this.web3.utils.bytesToHex(Array.from(decodedJws.decodedSignature.slice(0, 32))),
            s: this.web3.utils.bytesToHex(Array.from(decodedJws.decodedSignature.slice(32, 64))),
            v: this.web3.utils.numberToHex(decodedJws.decodedSignature[64] || 0)
        };
        const signingAccount = this.web3.eth.accounts.recover(signatureObject);

        return signingAccount === expectedSignerAccount;
    }
}
