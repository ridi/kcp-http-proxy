import { Mode } from "../common/config";

export enum CommandType {
    AUTH_KEY_REQ,
    PAY_REQ,
    PAY_CANCEL
}

export abstract class Command {
    readonly mode: Mode;
    readonly type: CommandType;

    protected constructor(mode: Mode, type: CommandType) {
        this.mode = mode;
        this.type = type;
    }
}

export class AuthKeyRequestCommand extends Command {
    readonly cardNumber: string;// 카드번호 공백없이 숫자만
    readonly cardExpiryDate: string;// 카드유효기간 년/월 4자리: 1810
    readonly cardTaxNumber: string;// 카드 인증번호: 개인 - 생년월일6 자리, 법인 - 사업자번호 10자리
    readonly cardPassword: string;// 카드 비밀번호 앞 2자리

    constructor(mode: Mode, cardNumber: string, cardExpiryDate: string, cardTaxNumber: string, cardPassword: string) {
        super(mode, CommandType.AUTH_KEY_REQ);
        this.cardNumber = cardNumber;
        this.cardExpiryDate = cardExpiryDate;
        this.cardTaxNumber = cardTaxNumber;
        this.cardPassword = cardPassword;
    }
}

export class PaymentApprovalCommand extends Command {
    readonly batchKey: string;//발급받은 배치키
    
    readonly orderId: string;
    readonly goodsName: string;
    readonly goodsPrice: number;
    readonly buyerName: string;
    readonly buyerTel1: string;
    readonly buyerTel2: string;
    readonly buyerEmail: string;

    readonly installmentMonths: number =0;//할부 개월수

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

export class PaymentCancellationCommand extends Command {
    readonly kcpTno: string;//KCP측 주문번호
    readonly reason: string;//취소사유

    constructor(mode: Mode, kcpTno: string, reason: string) {
        super(mode, CommandType.PAY_CANCEL);
        this.kcpTno = kcpTno;
        this.reason = reason;
    }
}