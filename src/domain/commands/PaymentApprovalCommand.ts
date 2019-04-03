import { AbstractKcpCommand } from '@root/domain/commands/AbstractKcpCommand';

export class PaymentApprovalCommand extends AbstractKcpCommand {
    constructor(
        isTaxDeductible: boolean,
        batchKey: string,
        orderNo: string,
        productName: string,
        productAmount: number,
        buyerName: string,
        buyerEmail: string,
        buyerTel1: string,
        buyerTel2: string,
        installmentMonths: number,
    ) {
        super(isTaxDeductible);
        this.batchKey = batchKey;
        this.orderNo = orderNo;
        this.productName = productName;
        this.productAmount = productAmount;
        this.buyerName = buyerName;
        this.buyerEmail = buyerEmail;
        this.buyerTel1 = buyerTel1;
        this.buyerTel2 = buyerTel2;
        this.installmentMonths = installmentMonths;
    }

    public readonly batchKey: string; // 발급받은 배치키
    public readonly orderNo: string;
    public readonly productName: string;
    public readonly productAmount: number;
    public readonly buyerName: string;
    public readonly buyerTel1: string;
    public readonly buyerTel2: string;
    public readonly buyerEmail: string;
    public readonly installmentMonths: number; // 할부 개월수
}
