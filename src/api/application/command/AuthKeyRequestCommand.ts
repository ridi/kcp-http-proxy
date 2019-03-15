import { Command } from "@app/application/command/Command";
import { CommandType } from "@app/application/command/CommandType";
import { Mode } from "@app/common/config";

export class AuthKeyRequestCommand extends Command {
    readonly card_number: string;// 카드번호 공백없이 숫자만
    readonly card_expiry_date: string;// 카드유효기간 년/월 4자리: 1810
    readonly card_tax_no: string;// 카드 인증번호: 개인 - 생년월일6 자리, 법인 - 사업자번호 10자리
    readonly card_password: string;// 카드 비밀번호 앞 2자리

    constructor(mode: Mode, cardNumber: string, cardExpiryDate: string, cardTaxNumber: string, cardPassword: string) {
        super(mode, CommandType.REQUEST_AUTH_KEY);
        this.card_number = cardNumber;
        this.card_expiry_date = cardExpiryDate;
        this.card_tax_no = cardTaxNumber;
        this.card_password = cardPassword;
    }
}