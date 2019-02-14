import { Command } from "./Command";
import { CommandType } from "./CommandType";
import { Mode } from "../../common/config";

export class PaymentCancellationCommand extends Command {
    readonly kcpTno: string;//KCP측 주문번호
    readonly reason: string;//취소사유

    constructor(mode: Mode, kcpTno: string, reason: string) {
        super(mode, CommandType.PAY_CANCEL);
        this.kcpTno = kcpTno;
        this.reason = reason;
    }
}