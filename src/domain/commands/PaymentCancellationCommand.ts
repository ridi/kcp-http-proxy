import { AbstractKcpCommand } from '@root/domain/commands/AbstractKcpCommand';

export class PaymentCancellationCommand extends AbstractKcpCommand {
    readonly tno: string;//KCP측 주문번호
    readonly reason: string;//취소사유

    constructor(isTaxDeductible: boolean, tno: string, reason: string) {
        super(isTaxDeductible);
        this.tno = tno;
        this.reason = reason;
    }
}