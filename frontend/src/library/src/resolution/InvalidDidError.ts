/* eslint-disable @typescript-eslint/no-useless-constructor */
export class InvalidDidError extends Error {
    constructor(message: string) {
        super(message);
    }
}
