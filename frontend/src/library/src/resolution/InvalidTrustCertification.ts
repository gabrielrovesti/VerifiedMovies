/* eslint-disable @typescript-eslint/no-useless-constructor */
export class InvalidTrustCertification extends Error {
    constructor(message: string) {
        super(message);
    }
}
