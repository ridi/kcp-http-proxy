import { IsNotEmpty } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";

@JSONSchema({
    description: "결제 취소 요청",
    required: [ "tno", "reason" ]
})
export class PaymentCancellationRequest extends KcpRequest {
    @JSONSchema({ description: "KCP 거래번호" })
    @IsNotEmpty({ message: "거래번호는 필수값입니다." })
    tno: string;

    @JSONSchema({ description: "취소사유" })
    @IsNotEmpty({ message: "취소사유는 필수값입니다." })
    reason: string;
}