import * as console from "console";
import * as util from "util";
import Web3 from "web3";
import {EcdsaSecp256k1Proof} from "../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1Proof";
import {
    EcdsaSecp256k1CreationOptions,
    EcdsaSecp256k1ProofManager,
    EcdsaSecp256k1VerificationOptions
} from "../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1ProofManager";
import {VerifiableCredentialManager} from "../src/credential/VerifiableCredentialManager";
import {VerifiablePresentationManager} from "../src/credential/VerifiablePresentationManager";
import {DidResolver, TrustCredential} from "../src/resolution/DidResolver";
import {FileUtils} from "../src/utils/FileUtils";
import {ContextLoader, JsonContextLoader} from "../src/utils/JsonContextLoaders";

const CONTRACT_ADDRESS = "0xe949D68a3CC6f870D5d628C0777AE8CDEC9b587B";
const CONTRACT_ABI_PATH = "../contract/build/src/contracts/ChainOfTrustDidSsi.json";
const GAS_LIMIT = 6721900;

async function testLibrary(): Promise<void> {
    const web3 = new Web3("http://127.0.0.1:7545");

    const resolver = new DidResolver(
        web3,
        JSON.parse(await FileUtils.readFileContent(CONTRACT_ABI_PATH)).abi,
        CONTRACT_ADDRESS,
        GAS_LIMIT
    );
    const proofManager = new EcdsaSecp256k1ProofManager(web3, resolver);
    const credentialManager = new VerifiableCredentialManager<
        EcdsaSecp256k1Proof,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions,
        EcdsaSecp256k1ProofManager
    >(web3, resolver, proofManager);
    const presentationManager = new VerifiablePresentationManager(web3, resolver, proofManager);

    // User:   0x06d7DE5A05B432646fdd7b3F41135403795D1189
    // Root:   0xE5d0B7D5E3675034efC721F6c584BE784331CB30
    // Issuer: 0xd14DaC2057Bd0BEbF442fa3C5be5b2b69bbcbe35

    // Create the user
    const userAccount = web3.eth.accounts.privateKeyToAccount(
        "0xc26901d0ca79738b55232a31f8667b0b5d5216c32be3a5e0fd753e7f4ba46477"
    );
    const userDid = await resolver.createNewDidFromAccount(userAccount);
    // Create the root issuer
    const rootAccount = web3.eth.accounts.privateKeyToAccount(
        "0x50b61dabbc9da5455fc48fe8c16e25bb779ca41d56ae9b4528dfc3d4f9b25bbd"
    );

    const rootDid = await resolver.createNewDidFromAccount(rootAccount);
    // Create the child issuer
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(
        "0x67033ee23107c92bfaafc3a1da45983460e4d5d65687c63ee9e89b746802f02f"
    );

    const issuerDid = await resolver.createNewDidFromAccount(issuerAccount);

    const chainId = await resolver.getChainId();

    const loader = new JsonContextLoader("./context");

    const credential = (await credentialManager.createVerifiableCredential<{id: string}>(
        {
            additionalContexts: [
                "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-2.0.jsonld",
                "https://www.ssicot.com/credentials/",
                "https://www.ssicot.com/RevocationList2023/"
            ],
            additionalTypes: ["CertificationCredential"],
            credentialSubject: {
                id: issuerDid.did
            },
            issuer: rootDid.did,
            expirationDate: new Date("2024-01-01T19:24:24Z"),
            credentialStatus: {
                id: `${rootDid.did}#revoc-1`,
                type: "RevocationList2023"
            }
        },
        {
            chainId,
            verificationMethod: `${rootDid.did}#assert-key-1`,
            proofPurpose: "assertionMethod",
            privateKey: rootDid.privateKey,
            documentLoader: loader.concatenateLoaders([
                ContextLoader.CERTIFICATION_CREDENTIAL_LOADER,
                ContextLoader.REVOCATION_LIST_LOADER
            ])
        }
    )) as TrustCredential;

    const trustedIssuers = new Set<string>();
    trustedIssuers.add(rootDid.did);
    const result = await resolver.updateTrustCertification(
        credential,
        `${issuerDid.did}#auth-key-1`,
        trustedIssuers,
        loader,
        issuerAccount.address
    );

    console.log(
        util.inspect(
            await resolver.resolveRepresentation(issuerDid.did, {
                accept: "application/did+ld+json"
            }),
            {showHidden: false, depth: null, colors: true}
        )
    );
    console.log(
        util.inspect(await resolver.resolveChain(issuerDid.did), {
            showHidden: false,
            depth: null,
            colors: true
        })
    );

    console.log("Error DID document");
    console.log(
        util.inspect(
            await resolver.resolveRepresentation(`${issuerDid.did.slice(-2)}aa`, {
                accept: "application/did+ld+json"
            }),
            {showHidden: false, depth: null, colors: true}
        )
    );

    console.log("Error DID URL");
    console.log(
        util.inspect(
            await resolver.resolveDidUrl(`${issuerDid.did}#aaaaaa`, {
                accept: "application/did+ld+json"
            }),
            {showHidden: false, depth: null, colors: true}
        )
    );

    await resolver.clear(userDid.account.address);
}

try {
    testLibrary().then();
} catch (e) {
    console.error(e);
}
