export class InvalidRequestException extends Error {
    readonly errors: object;

    constructor(errors: object) {
        super();
        this.errors = errors;
    }
}