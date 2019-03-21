import { AbstractCommand } from '@root/application/commands/AbstractCommand';
import { Config } from '@root/common/config';

export class PaymentAuthKeyCommand extends AbstractCommand {
    readonly card_number: string;// 카드번호 공백없이 숫자만
    readonly card_expiry_date: string;// 카드유효기간 년/월 4자리: 1810
    readonly card_tax_no: string;// 카드 인증번호: 개인 - 생년월일6 자리, 법인 - 사업자번호 10자리
    readonly card_password: string;// 카드 비밀번호 앞 2자리

    constructor(config: Config, cardNumber: string, cardExpiryDate: string, cardTaxNumber: string, cardPassword: string) {
        super(config);
        this.card_number = cardNumber;
        this.card_expiry_date = cardExpiryDate;
        this.card_tax_no = cardTaxNumber;
        this.card_password = cardPassword;
    }
}
