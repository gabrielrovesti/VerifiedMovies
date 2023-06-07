/* eslint-disable @typescript-eslint/no-useless-constructor */
export class InvalidVerifiableCredentialError extends Error {
    constructor(message: string) {
        super(message);
    }
}
