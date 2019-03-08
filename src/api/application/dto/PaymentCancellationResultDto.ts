import { IsBoolean, IsNumber, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";

@JSONSchema({ description: "결제 취소 결과" })
export class PaymentCancellationResultDto {
    @JSONSchema({ description: "KCP 결과 코드: 0000 (정상처리)" })
    @IsString()
    code: string;

    @JSONSchema({ description: "KCP 결과 메시지" })
    @IsString()
    message: string;

    @JSONSchema({ description: "KCP 결과 성공 여부" })
    @IsBoolean()
    is_success: boolean;

    @JSONSchema({ description: "영문 메시지" })
    @IsString()
    en_message: string;

    @JSONSchema({ description: "KCP 결제 고유 번호" })
    @IsString()
    trace_no: string;

    @JSONSchema({ description: "사용 결제 수단" })
    @IsString()
    pay_method: string;

    @JSONSchema({ description: "가맹점 주문 번호" })
    @IsString()
    order_no: string;

    @JSONSchema({ description: "카드 발급사 코드" })
    @IsString()
    card_code: string;

    @JSONSchema({ description: "카드 이름" })
    @IsString()
    card_name: string;

    @JSONSchema({ description: "카드 매입사 코드" })
    @IsString()
    acqu_code: string;

    @JSONSchema({ description: "카드 매입사 이름", format: "한글" })
    @IsString()
    acqu_name: string;

    @JSONSchema({ description: "카드 번호" })
    @IsString()
    card_no: string;

    @JSONSchema({ description: "" })
    @IsString()
    mcht_taxno: string;

    @JSONSchema({ description: "가맹점 주문 번호??" })
    @IsString()
    mall_taxno: string;

    @JSONSchema({ description: "" })
    @IsString()
    ca_order_id: string;

    @JSONSchema({ description: "KCP 거래 번호" })
    @IsString()
    tno: string;

    @JSONSchema({ description: "총 결제 금액" })
    @IsNumber()
    amount: number;

    @JSONSchema({ description: "카드 결제 금액" })
    @IsNumber()
    card_amount: number;

    @JSONSchema({ description: "쿠폰 결제 금액" })
    @IsNumber()
    coupon_amount: number;

    @JSONSchema({ description: "에스크로 사용 여부" })
    @IsBoolean()
    is_escrow: boolean;

    @JSONSchema({ description: "매입 취소/승인 취소의 구분값" })
    @IsString()
    cancel_gubun: string;

    @JSONSchema({ description: "VAN사 코드" })
    @IsString()
    van_code: string;

    @JSONSchema({ description: "결제 승인 시각(공통)", format: "yyyyMMddHHmmss" })
    @IsString()
    app_time: string;

    @JSONSchema({ description: "VAN사 결제 승인 시각" })
    @IsString()
    van_app_time: string;

    @JSONSchema({ description: "결제 취소 시각", format: "yyyyMMddHHmmss" })
    @IsString()
    cancel_time: string;

    @JSONSchema({ description: "정상 결제 거래의 승인 번호, KCP와 카드사에서 공통적으로 관리하는 번호" })
    @IsString()
    app_no: string;

    @JSONSchema({ description: "" })
    @IsString()
    bizx_no: string;

    @JSONSchema({ description: "할부 개월(0: 일시불)", format: "0~12" })
    @IsNumber()
    quota: number;

    @JSONSchema({ description: "무이자 할부 결제 여부" })
    @IsBoolean()
    is_interest_free: boolean;

    @JSONSchema({ description: "" })
    @IsString()
    pg_txid: string;
}