import { IsString } from 'class-validator';

export class MessageResponse {
    constructor(message: string) {
        this.message = message.startsWith('Command failed') ? 'KCP Error' : message;
    }

    @IsString()
    public message: string;
}
