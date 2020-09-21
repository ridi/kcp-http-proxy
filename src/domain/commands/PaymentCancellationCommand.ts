import { AbstractKcpCommand } from '@root/domain/commands/AbstractKcpCommand';

export class PaymentCancellationCommand extends AbstractKcpCommand {
  constructor(isTaxDeductible: boolean, tno: string, reason: string) {
    super(isTaxDeductible);
    this.tno = tno;
    this.reason = reason;
  }

  public readonly tno: string; // KCP측 주문번호
  public readonly reason: string; // 취소사유
}
