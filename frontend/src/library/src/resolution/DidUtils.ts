import {InvalidArgumentError} from "../utils/InvalidArgumentError";
import {DidResolver} from "./DidResolver";
import {DereferenceResult,DidDocument,DidDocumentMetadata,DidResolutionResult,DidUrl,DidUrlDereferenceResult,ErrorDereferenceResult,ErrorResolutionResult,SuccessfulDereferenceResult} from "./DidTypes";
import {InvalidDidError} from "./InvalidDidError";

export class DidUtils {
    public static isValidUrl(url: string) {
        return this.parseUrl(url) !== null;
    }

    public static isValidDid(did: string, chainId: number): boolean {
        if (did.slice(0, 16) === "did:ssi-cot-eth:") {
            const remaining = did.slice(16).split(":");
            if (remaining.length === 2) {
                return (
                    remaining[0] === `${chainId}` &&
                    (remaining[1] || "").match(/[0-9a-f]{40}/g) !== null
                );
            }
        }
        return false;
    }

    public static isValidDidUrl(didUrl: string, chainId: number) {
        const url = this.parseDidUrlContent(didUrl);

        return url !== null && DidUtils.isValidDid(url.did, chainId);
    }

    public static parseDidUrl(didUrl: string, chainId: number): DidUrl {
        const url = this.parseDidUrlContent(didUrl);

        if (url === null || !DidUtils.isValidDid(url.did, chainId)) {
            throw new InvalidDidError(`The DID URL '${didUrl}' is not valid`);
        }
        return url;
        /*
        hash:"#auth-key-1"
        host:""
        hostname:""
        href:"did:ssi-cot-eth:5777:ebfeb1f712ebcdef12345678bc6f1c276e12ec21?service=abc#auth-key-1"
        origin:"null"
        password:""
        pathname:"ssi-cot-eth:5777:ebfeb1f712ebcdef12345678bc6f1c276e12ec21"
        port:""
        protocol:"did:"
        search:"?service=abc"
        searchParams: URLSearchParams {size: 1}
        username:""
         */
    }

    private static parseDidUrlContent(didUrl: string): DidUrl | null {
        const parsedUrl = this.parseUrl(didUrl);

        if (parsedUrl === null) {
            return null;
        }

        return {
            did: `${parsedUrl.protocol}${parsedUrl.pathname}`,
            query: parsedUrl.searchParams,
            fragment: parsedUrl.hash.slice(1)
        };
    }

    private static parseUrl(url: string): URL | null {
        try {
            return new URL(url);
        } catch (e: unknown) {
            return null;
        }
    }

    public static isContentDidDocument(
        dereferenceResult: SuccessfulDereferenceResult
    ): dereferenceResult is DereferenceResult<DidDocument, DidDocumentMetadata> {
        return !("resourceType" in dereferenceResult.contentMetadata);
    }

    public static isResolutionErrored(
        resolutionResult: DidResolutionResult
    ): resolutionResult is ErrorResolutionResult {
        return "error" in resolutionResult.didResolutionMetadata;
    }

    public static async checkForDereferencingErrors<T extends Error>(
        didResolver: DidResolver,
        didUrl: string,
        invalidDidUrlErrorMessage: string,
        notFoundErrorMessage: string,
        errorConstructor: {new (message: string): T}
    ): Promise<SuccessfulDereferenceResult> {
        const dereferencingResult = await didResolver.resolveDidUrl(didUrl);

        if (DidUtils.isErrored(dereferencingResult)) {
            const dereferencingError = dereferencingResult.dereferencingMetadata.error;
            let errorMessage: string;
            switch (dereferencingError) {
                case "invalidDidUrl":
                    errorMessage = invalidDidUrlErrorMessage;
                    break;
                case "notFound":
                    errorMessage = "The verification method specified in the proof cannot be found";
                    break;
                case "methodNotSupported":
                    const dividedDid = didUrl.split(":");
                    errorMessage = `The DID method 'did:${dividedDid[1]} is not supported`;
                    break;
                default:
                    errorMessage = `Unable to dereference the DID URL '${didUrl}`;
            }
            throw new errorConstructor(errorMessage);
        }

        return dereferencingResult;
    }

    public static async eip155ToAddress(eip155Address: string) {
        if (!eip155Address.startsWith("eip155:")) {
            throw new InvalidArgumentError(`${eip155Address} is not a valid EIP-155 address`);
        }
        return `0x${eip155Address.slice(-40)}`;
    }

    public static isErrored(
        dereferencingResult: DidUrlDereferenceResult
    ): dereferencingResult is ErrorDereferenceResult {
        return "error" in dereferencingResult.dereferencingMetadata;
    }
}
