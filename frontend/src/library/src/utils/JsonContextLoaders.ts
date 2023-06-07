import {PathLike} from "fs";
import JsonLd from "jsonld";
import {RemoteDocument, Url} from "jsonld/jsonld-spec";
import {FileUtils} from "./FileUtils";
import {InvalidArgumentError} from "./InvalidArgumentError";

export type LoaderFunction = (url: Url) => Promise<RemoteDocument>;

export enum ContextLoader {
    DID_DOCUMENT_LOADER,
    CHAIN_RESOLUTION_LOADER,
    CERTIFICATION_CREDENTIAL_LOADER,
    DID_RESOLUTION_LOADER,
    REVOCATION_LIST_LOADER
}

export class JsonContextLoader {
    public static readonly DEFAULT_DOCUMENT_LOADER = (url: Url) => JsonLd.documentLoaders.node()(url);

    private readonly contextsPath: PathLike;

    constructor(contextsPath: PathLike) {
        this.contextsPath = contextsPath;
    }

    public concatenateLoaders(
        loaders: ContextLoader[],
        defaultLoader = JsonContextLoader.DEFAULT_DOCUMENT_LOADER
    ): LoaderFunction {
        let result = defaultLoader;

        for (const loader of loaders) {
            result = JsonContextLoader.getLoader(this.contextsPath, loader)(result);
        }

        return result;
    }

    private static getLoader(
        contextsPath: PathLike,
        loader: ContextLoader
    ): (nextLoader: LoaderFunction) => LoaderFunction {
        switch (loader) {
            case ContextLoader.DID_DOCUMENT_LOADER:
                return JsonContextLoader.createLoaderFunction(
                    "https://www.ssicot.com/did-document",
                    `${contextsPath}/did-document.jsonld`
                );
            case ContextLoader.CHAIN_RESOLUTION_LOADER:
                return JsonContextLoader.createLoaderFunction(
                    "https://www.ssicot.com/chain-resolution/",
                    `${contextsPath}/chain-resolution.jsonld`
                );
            case ContextLoader.CERTIFICATION_CREDENTIAL_LOADER:
                return JsonContextLoader.createLoaderFunction(
                    "https://www.ssicot.com/credentials/",
                    `${contextsPath}/certification-credential.jsonld`
                );
            case ContextLoader.DID_RESOLUTION_LOADER:
                return JsonContextLoader.createLoaderFunction(
                    "https://www.ssicot.com/did-resolution/",
                    `${contextsPath}/did-resolution.jsonld`
                );
            case ContextLoader.REVOCATION_LIST_LOADER:
                return JsonContextLoader.createLoaderFunction(
                    "https://www.ssicot.com/RevocationList2023/",
                    `${contextsPath}/revocation-list-2023.jsonld`
                );
            default:
                throw new InvalidArgumentError("Unknown context loader");
        }
    }

    private static createLoaderFunction(
        contextUrl: string,
        contextPath: PathLike
    ): (nextLoader: LoaderFunction) => LoaderFunction {
        const parsedUrlHref = new URL(contextUrl).href;

        return (nextLoader: LoaderFunction) => async (url: Url) => {
            if (new URL(url).href === parsedUrlHref) {
                return {
                    // this is for a context via a link header
                    contextUrl: undefined,
                    // this is the actual document that was loaded
                    document: JSON.parse(await FileUtils.readFileContent(contextPath)),
                    // this is the actual context URL after redirects
                    documentUrl: url
                };
            }
            return nextLoader(url);
        };
    }
}
