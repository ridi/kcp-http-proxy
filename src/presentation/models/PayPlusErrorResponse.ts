import { IsString } from 'class-validator';

export class PayPlusErrorResponse {
    constructor(code: string, message: string) {
        this.code = code;
        this.message = message;
    }

    @IsString()
    public code: string;

    @IsString()
    public message: string;
}
