import { Command } from "./Command";
import { CommandType } from "./CommandType";
import { Mode } from "../../common/config";

export class PaymentApprovalCommand extends Command {
    readonly batchKey: string;//발급받은 배치키    
    readonly orderId: string;
    readonly goodsName: string;
    readonly goodsPrice: number;
    readonly buyerName: string;
    readonly buyerTel1: string;
    readonly buyerTel2: string;
    readonly buyerEmail: string;

    readonly installmentMonths: number = 0;//할부 개월수

    constructor(
        mode: Mode,
        batchKey: string,
        orderId: string,
        goodsName: string,
        goodsPrice: number,
        buyerName: string,
        buyerEmail: string,
        buyerTel1: string,
        buyerTel2: string,
    ) {
        super(mode, CommandType.PAY_REQ);
        this.batchKey = batchKey;
        this.orderId = orderId;
        this.goodsName = goodsName;
        this.goodsPrice = goodsPrice;
        this.buyerName = buyerName;
        this.buyerEmail = buyerEmail;
        this.buyerTel1 = buyerTel1;
        this.buyerTel2 = buyerTel2;
    }
}