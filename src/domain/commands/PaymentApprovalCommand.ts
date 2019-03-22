import { AbstractKcpCommand } from '@root/domain/commands/AbstractKcpCommand';

export class PaymentApprovalCommand extends AbstractKcpCommand {
    readonly batchKey: string;//발급받은 배치키    
    readonly orderNo: string;
    readonly productName: string;
    readonly productAmount: number;
    readonly buyerName: string;
    readonly buyerTel1: string;
    readonly buyerTel2: string;
    readonly buyerEmail: string;
    readonly installmentMonths: number;//할부 개월수

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
        installmentMonths: number
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
}
