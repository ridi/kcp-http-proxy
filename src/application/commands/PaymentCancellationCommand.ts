import { AbstractCommand } from "@root/application/commands/AbstractCommand";
import { Config } from "@root/common/config";

export class PaymentCancellationCommand extends AbstractCommand {
    readonly tno: string;//KCP측 주문번호
    readonly reason: string;//취소사유

    constructor(config: Config, tno: string, reason: string) {
        super(config);
        this.tno = tno;
        this.reason = reason;
    }
}