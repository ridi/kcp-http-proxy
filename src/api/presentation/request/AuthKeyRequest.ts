import { Matches } from "class-validator";
import { KcpRequest } from "./KcpRequest";

export class AuthKeyRequest extends KcpRequest {
    @Matches(/^\d{16}$/, {
        message: "카드번호가 올바르지 않습니다.\n카드번호는 공백없이 숫자만 가능합니다."
    })
    cardNumber: string;

    @Matches(/^(\d{2})(0[1-9]|1[012])$/, {
        message: "카드유효기간이 올바르지 않습니다.\n카드유효기간은 연/월(YYMM) 4자리 숫자입니다."
    })
    cardExpiryDate: string;

    @Matches(/^(?=\d*$)(?:(\d{2})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])|.{10})$/, {
        message: "카드인증번호가 올바르지 않습니다.\n카드인증번호는 생년월일6자리(개인) 혹은 사업자번호10자리(법인)입니다."
    })
    cardTaxNumber: string;

    @Matches(/^([0-9]{2})$/, {
        message: "카드비밀번호가 올바르지 않습니다.\n카드비밀번호 앞 2자리를 입력해주십시오."
    })
    cardPassword: string;
}