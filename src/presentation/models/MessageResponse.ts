import { IsString } from 'class-validator';

export class MessageResponse {
  constructor(message: string) {
    this.message = message;
  }

  @IsString()
  public message: string;
}
