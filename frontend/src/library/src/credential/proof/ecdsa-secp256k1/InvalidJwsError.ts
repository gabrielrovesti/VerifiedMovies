import 'crypto-browserify';
import 'stream-http';
import 'https-browserify';
import 'os-browserify/browser';


export class InvalidJwsError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, {
            cause
        });
    }
}
