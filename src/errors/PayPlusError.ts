
export class PayPlusError extends Error {
    readonly code: string;

    constructor(res_cd: string = '', res_msg: string) {
        super(res_msg);        
        this.code = res_cd;
    }
}