/* eslint-disable @typescript-eslint/no-useless-constructor */
export class InvalidVerifiablePresentationError extends Error {
    constructor(message: string) {
        super(message);
    }
}
