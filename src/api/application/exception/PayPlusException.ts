export class PayPlusException extends Error {
    readonly code: string;
    
    readonly isSuccess: boolean = false;

    constructor(res_cd: string = "", res_msg: string) {
        super(res_msg);
        this.code = res_cd;
    }
}