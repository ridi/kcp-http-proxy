import { IsNotEmpty } from "class-validator";
import { KcpRequest } from "./KcpRequest";

export class PaymentApprovalRequest extends KcpRequest {
    @IsNotEmpty({ message: "빌링키는 필수값입니다."})
    billKey: string;

    @IsNotEmpty({ message: "거래번호는 필수값입니다." })
    txId: string;

    @IsNotEmpty({ message: "상품명은 필수값입니다." })
    productName: string;

    @IsNotEmpty({ message: "상품금액은 필수값입니다." })
    productAmount: number;

    @IsNotEmpty({ message: "구매자 이름은 필수값입니다." })
    buyerName: string;

    @IsNotEmpty({ message: "구매자 이메일 주소는 필수값입니다." })
    buyerEmail: string;
}