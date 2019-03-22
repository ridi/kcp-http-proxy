import { AbstractKcpCommand } from '@root/domain/commands/AbstractKcpCommand';

export class PaymentBatchKeyCommand extends AbstractKcpCommand {
    readonly cardNumber: string;// 카드번호 공백없이 숫자만
    readonly cardExpiryDate: string;// 카드유효기간 년/월 4자리: 1810
    readonly cardTaxNumber: string;// 카드 인증번호: 개인 - 생년월일6 자리, 법인 - 사업자번호 10자리
    readonly cardPassword: string;// 카드 비밀번호 앞 2자리

    constructor(isTaxDeductible: boolean, cardNumber: string, cardExpiryDate: string, cardTaxNumber: string, cardPassword: string) {
        super(isTaxDeductible);
        this.cardNumber = cardNumber;
        this.cardExpiryDate = cardExpiryDate;
        this.cardTaxNumber = cardTaxNumber;
        this.cardPassword = cardPassword;
    }
}