import * as jsonld from "jsonld";

async function doTest() {
    const doc = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-2.0.jsonld",
            {
                "@context": {
                    "@version": 1.1,
                    "@protected": true,
                    "CertificationCredential": {
                        "@id": "https://www.ssicoteth.com/#CertificationCredential"
                    }
                }
            },
            {
                "@context": {
                    "@version": 1.1,
                    "@protected": true,
                    "RevocationList2023": {
                        "@id": "https://www.ssicoteth.com/#RevocationList2023"
                    }
                }
            }
        ],
        "type": ["VerifiableCredential", "CertificationCredential"],
        "credentialSubject": {
            "id": "did:ssi-cot-eth:5777:ebfeb1f712ebcdef12345678bc6f1c276e12ec21"
        },
        "issuer": "did:ssi-cot-eth:5777:76e12ec71bcdef123456782ebc6f1c221ebfeb1f",
        "issuanceDate": "2023-01-01T19:23:24Z",
        "expirationDate": "2023-01-01T19:24:24Z",
        "credentialStatus": {
            "id": "did:ssi-cot-eth:5777:ebfeb1f712ebcdef12345678bc6f1c276e12ec21#revoc-57",
            "type": "RevocationList2023"
        }
    };

    // canonize (normalize) a document using the RDF Dataset Canonicalization Algorithm
    // (URDNA2015):
    const canonized = await jsonld.canonize(doc, {
        algorithm: "URDNA2015",
        format: "application/n-quads"
    });
    console.log('"-/', canonized, '/-"');
}

async function main() {
    try {
        await doTest();
    } catch (e) {
        console.error(e);
    }
}

main().then();
