/* eslint-disable @typescript-eslint/no-useless-constructor */
export class InvalidArgumentError extends Error {
    constructor(message: string) {
        super(message);
    }
}
