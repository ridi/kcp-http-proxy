export class AlreadyLockedError extends Error {
    constructor(message?: string) {
        super(message);
    }
}
