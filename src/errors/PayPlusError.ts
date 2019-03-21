import { Command } from "@root/application/commands";

export class PayPlusError extends Error {
    readonly code: string;
    
    readonly is_success: boolean = false;

    readonly command: Command;

    constructor(res_cd: string = "", res_msg: string, command: Command) {
        super(res_msg);        
        this.code = res_cd;
        this.command = command;
    }
}