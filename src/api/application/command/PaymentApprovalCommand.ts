import { Command } from "@app/application/command/Command";
import { CommandType } from "@app/application/command/CommandType";
import { Mode } from "@app/common/config";

export class PaymentApprovalCommand extends Command {
    readonly batch_key: string;//발급받은 배치키    
    readonly order_id: string;
    readonly goods_name: string;
    readonly goods_price: number;
    readonly buyer_name: string;
    readonly buyer_tel1: string;
    readonly buyer_tel2: string;
    readonly buyer_email: string;

    readonly installment_months: number = 0;//할부 개월수

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
        super(mode, CommandType.PAYMENT_APPROVAL);
        this.batch_key = batchKey;
        this.order_id = orderId;
        this.goods_name = goodsName;
        this.goods_price = goodsPrice;
        this.buyer_name = buyerName;
        this.buyer_email = buyerEmail;
        this.buyer_tel1 = buyerTel1;
        this.buyer_tel2 = buyerTel2;
    }
}