import { AbstractCommand } from '@root/application/commands/AbstractCommand';

export class PayPlusError extends Error {
    readonly code: string;
    
    readonly is_success: boolean = false;

    readonly command: AbstractCommand;

    constructor(res_cd: string = '', res_msg: string, command: AbstractCommand) {
        super(res_msg);        
        this.code = res_cd;
        this.command = command;
    }
}