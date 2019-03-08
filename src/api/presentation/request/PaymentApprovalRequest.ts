import { IsEmail, IsNotEmpty } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { KcpRequest } from "/presentation/request/KcpRequest";

@JSONSchema({
    description: "결제 요청",
    required: [ "bill_key", "order_no", "product_name", "product_amount", "buyer_name", "buyer_email" ]
})
export class PaymentApprovalRequest extends KcpRequest {
    @JSONSchema({ description: "빌링(인증/배치)키" })
    @IsNotEmpty({ message: "빌링키는 필수값입니다."})
    bill_key: string;

    @JSONSchema({ description: "가맹점 주문번호" })
    @IsNotEmpty({ message: "거래번호는 필수값입니다." })
    order_no: string;

    @JSONSchema({ description: "결제 상품명" })
    @IsNotEmpty({ message: "상품명은 필수값입니다." })
    product_name: string;

    @JSONSchema({ description: "결제 상품 금액" })
    @IsNotEmpty({ message: "상품금액은 필수값입니다." })
    product_amount: number;

    @JSONSchema({ description: "상품 구매자 이름" })
    @IsNotEmpty({ message: "구매자 이름은 필수값입니다." })
    buyer_name: string;

    @JSONSchema({ description: "상품 구매자 이메일 주소" })
    @IsNotEmpty({ message: "구매자 이메일 주소는 필수값입니다." })
    @IsEmail()
    buyer_email: string;
}