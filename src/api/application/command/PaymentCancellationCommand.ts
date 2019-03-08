import { Command } from "./Command";
import { CommandType } from "./CommandType";
import { Mode } from "../../common/config";

export class PaymentCancellationCommand extends Command {
    readonly tno: string;//KCP측 주문번호
    readonly reason: string;//취소사유

    constructor(mode: Mode, tno: string, reason: string) {
        super(mode, CommandType.PAYMENT_CANCELLATION);
        this.tno = tno;
        this.reason = reason;
    }
}