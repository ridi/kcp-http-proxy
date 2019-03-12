import { Matches } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { KcpRequest } from "../../presentation/request/KcpRequest";

@JSONSchema({
    description: "결제를 위한 카드 인증(배치)키 요청",
    required: [ "card_no", "card_expiry_date", "card_tax_no", "card_password" ]
})
export class AuthKeyRequest extends KcpRequest {
    @JSONSchema({ description: "카드번호 16자리", example: "1234567855550000" })
    @Matches(/^\d{16}$/, {
        message: "카드번호가 올바르지 않습니다. 카드번호는 공백없이 숫자만 가능합니다."
    })
    card_no: string;

    @JSONSchema({ description: "카드유효기간 연월(YYMM) 4자리", example: "2908" })
    @Matches(/^(\d{2})(0[1-9]|1[012])$/, {
        message: "카드유효기간이 올바르지 않습니다. 카드유효기간은 연/월(YYMM) 4자리 숫자입니다."
    })
    card_expiry_date: string;

    @JSONSchema({ description: "카드인증번호 - 개인:생연월일 6자리, 법인:사업자번호 10자리", examples: ["790701", "1000000000"] })
    @Matches(/^(?=\d*$)(?:(\d{2})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])|.{10})$/, {
        message: "카드인증번호가 올바르지 않습니다. 카드인증번호는 생년월일6자리(개인) 혹은 사업자번호10자리(법인)입니다."
    })
    card_tax_no: string;

    @JSONSchema({ description: "카드비밀번호 앞 2자리", example: "00" })
    @Matches(/^([0-9]{2})$/, {
        message: "카드비밀번호가 올바르지 않습니다. 카드비밀번호 앞 2자리를 입력해주십시오."
    })
    card_password: string;
}