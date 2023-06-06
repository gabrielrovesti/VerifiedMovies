import {LanguageMap} from "jsonld/jsonld";

export interface Proof extends LanguageMap {
    type: string;
    [property: string]: any
}
