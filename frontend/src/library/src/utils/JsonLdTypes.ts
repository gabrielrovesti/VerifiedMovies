import {Options} from "jsonld";
import {ContextDefinition} from "jsonld/jsonld";

export type JsonLdContexts = (string | ContextDefinition)[];
export type DocumentLoader = Options.DocLoader["documentLoader"];

export type WithContext<T> = T & {"@context": JsonLdContexts};
