import {DefaultDocumentLoader, Options} from "jsonld";
import {RemoteDocument, Url} from "jsonld/jsonld-spec";

declare module "jsonld" {
    export type DefaultDocumentLoader = ({
                                             secure,
                                             strictSSL = true,
                                             maxRedirects = -1,
                                             headers = {},
                                             httpAgent,
                                             httpsAgent
                                         } = {
        strictSSL: true,
        maxRedirects: -1,
        headers: {}
    }) => ((url: Url) => Promise<RemoteDocument>);
    export namespace documentLoaders {
        let node: DefaultDocumentLoader;
        let xhr: DefaultDocumentLoader;
    }

    export function documentLoader(url: Url): Promise<RemoteDocument>;
}
