import { IsNotEmpty, Matches, validate } from "class-validator";
import { Service } from "typedi";
import { Mode } from "../common/config";

export abstract class AbstractRequest {
    @Matches(/^[dpx]{1}$/, {
        message: "mode가 올바르지 않습니다.\nmode는 d(Development), p(Production), t(Production-Tax Deduction) 중에 하나이어야 합니다."
    })
    mode: Mode;
}

export class ReceiptLinkRequest extends AbstractRequest {
    cmd: string;
    tno: string;
    order_no: string;
    trade_mony: string;
}

export class AuthKeyRequest extends AbstractRequest {
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

export class PaymentApprovalRequest extends AbstractRequest {
    @IsNotEmpty({ message: "빌링키는 필수값입니다."})
    billKey: string;

    @IsNotEmpty({ message: "거래번호는 필수값입니다." })
    txId: string;

    @IsNotEmpty({message: "상품명은 필수값입니다."})
    productName: string;

    @IsNotEmpty({ message: "상품금액은 필수값입니다." })
    productAmount: number;

    @IsNotEmpty({ message: "구매자 이름은 필수값입니다." })
    buyerName: string;

    @IsNotEmpty({ message: "구매자 이메일 주소는 필수값입니다." })
    buyerEmail: string;
}

export class PaymentCancellationRequest extends AbstractRequest {
    @IsNotEmpty({ message: "거래번호는 필수값입니다." })
    txId: string;

    @IsNotEmpty({ message: "취소사유는 필수값입니다." })
    reason: string;
}

@Service()
export class RequestValidator {
    validate(request: AbstractRequest): Promise<string> {
        return validate(request)
            .then(errors => {
                if (errors.length > 0) {
                    let resolvedErrors: object = {};
                    for (const error of errors) {
                        resolvedErrors[error.property] = Object.entries(error.constraints).map(([key, val]) => val).join("/n");
                    }

                    return Promise.reject(new InvalidRequestException(resolvedErrors));
                }
                return Promise.resolve('pass');
            });
    }   
}

export class InvalidRequestException extends Error {
    readonly errors: object;

    constructor(errors: object) {
        super();
        this.errors = errors;
    }
}