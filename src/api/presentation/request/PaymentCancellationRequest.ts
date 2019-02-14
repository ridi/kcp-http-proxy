import { IsNotEmpty } from "class-validator";
import { KcpRequest } from "./KcpRequest";

export class PaymentCancellationRequest extends KcpRequest {
    @IsNotEmpty({ message: "거래번호는 필수값입니다." })
    txId: string;

    @IsNotEmpty({ message: "취소사유는 필수값입니다." })
    reason: string;
}