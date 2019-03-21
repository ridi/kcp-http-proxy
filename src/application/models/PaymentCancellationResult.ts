import { attribute, rangeKey } from "@aws/dynamodb-data-mapper-annotations";
import { IsBoolean, IsNumber, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";

export type PaymentCancellationResultType = {
    res_cd: string;
    res_msg: string;
    res_en_msg: string;
    trace_no: string;
    pay_method: string;
    order_no: string;
    card_cd: string;
    card_name: string;
    acqu_cd: string;
    acqu_name: string;
    mcht_taxno: string;
    mall_taxno: string;
    ca_order_id: string;
    tno: string;
    amount: string;
    card_mny: string;
    coupon_mny: string;
    escw_yn: string;
    canc_gubn: string;
    van_cd: string;
    app_time: string;
    van_apptime: string;
    canc_time: string;
    app_no: string;
    bizx_numb: string;
    quota: string;
    noinf: string;
    pg_txid: string;
};

@JSONSchema({ description: "결제 취소 결과" })
export class PaymentCancellationResult {
    static parse(output: PaymentCancellationResultType): PaymentCancellationResult {
        const result: PaymentCancellationResult = new PaymentCancellationResult();
        result.code = output.res_cd;
        result.message = output.res_msg;
        result.en_message = output.res_en_msg;
        result.trace_no = output.trace_no;
        result.pay_method = output.pay_method;
        result.order_no = output.order_no;
        result.card_code = output.card_cd;
        result.card_name = output.card_name;
        result.acquirer_code = output.acqu_cd;
        result.acquirer_name = output.acqu_name;
        result.merchant_tax_no = output.mcht_taxno;
        result.mall_tax_no = output.mall_taxno;
        result.ca_order_id = output.ca_order_id;
        result.tno = output.tno;
        result.amount = <number>parseInt(output.amount || "0");
        result.card_amount = <number>parseInt(output.card_mny || "0");
        result.coupon_amount = <number>parseInt(output.coupon_mny || "0");
        result.is_escrow = (output.escw_yn || "N") === "Y";
        result.cancel_gubun = output.canc_gubn;
        result.van_code = output.van_cd;
        result.approval_time = output.app_time;
        result.van_approval_time = output.van_apptime;
        result.cancel_time = output.canc_time;
        result.approval_no = output.app_no;
        result.business_no = output.bizx_numb;
        result.quota = <number>parseInt(output.quota || "0");
        result.is_interest_free = (output.noinf || "N") === "Y";
        result.pg_tx_id = output.pg_txid;
        return result;
    }

    @JSONSchema({ description: "KCP 결과 코드: 0000 (정상처리)" })
    @IsString()
    @attribute()
    code: string;

    @JSONSchema({ description: "KCP 결과 메시지" })
    @IsString()
    @attribute()
    message: string;

    @JSONSchema({ description: "영문 메시지" })
    @IsString()
    @attribute()
    en_message: string;

    @JSONSchema({ description: "KCP 결제 고유 번호" })
    @IsString()
    @attribute()
    trace_no: string;

    @JSONSchema({ description: "사용 결제 수단" })
    @IsString()
    @attribute()
    pay_method: string;

    @JSONSchema({ description: "가맹점 주문 번호" })
    @IsString()
    @attribute()
    order_no: string;

    @JSONSchema({ description: "카드 발급사 코드" })
    @IsString()
    @attribute()
    card_code: string;

    @JSONSchema({ description: "카드 이름" })
    @IsString()
    @attribute()
    card_name: string;

    @JSONSchema({ description: "카드 매입사 코드" })
    @IsString()
    @attribute()
    acquirer_code: string;

    @JSONSchema({ description: "카드 매입사 이름", format: "한글" })
    @IsString()
    @attribute()
    acquirer_name: string;

    @JSONSchema({ description: "카드 번호" })
    @IsString()
    @attribute()
    card_no: string;

    @JSONSchema({ description: "" })
    @IsString()
    @attribute()
    merchant_tax_no: string;

    @JSONSchema({ description: "가맹점 인증 번호" })
    @IsString()
    @attribute()
    mall_tax_no: string;

    @JSONSchema({ description: "" })
    @IsString()
    @attribute()
    ca_order_id: string;

    @JSONSchema({ description: "KCP 거래 번호" })
    @IsString()
    @attribute()
    tno: string;

    @JSONSchema({ description: "총 결제 금액" })
    @IsNumber()
    @attribute()
    amount: number;

    @JSONSchema({ description: "카드 결제 금액" })
    @IsNumber()
    @attribute()
    card_amount: number;

    @JSONSchema({ description: "쿠폰 결제 금액" })
    @IsNumber()
    @attribute()
    coupon_amount: number;

    @JSONSchema({ description: "에스크로 사용 여부" })
    @IsBoolean()
    @attribute()
    is_escrow: boolean;

    @JSONSchema({ description: "매입 취소/승인 취소의 구분값" })
    @IsString()
    @attribute()
    cancel_gubun: string;

    @JSONSchema({ description: "VAN사 코드" })
    @IsString()
    @attribute()
    van_code: string;

    @JSONSchema({ description: "결제 승인 시각(공통)", format: "yyyyMMddHHmmss" })
    @IsString()
    @attribute()
    approval_time: string;

    @JSONSchema({ description: "VAN사 결제 승인 시각" })
    @IsString()
    @attribute()
    van_approval_time: string;

    @JSONSchema({ description: "결제 취소 시각", format: "yyyyMMddHHmmss" })
    @IsString()
    @attribute()
    cancel_time: string;

    @JSONSchema({ description: "정상 결제 거래의 승인 번호, KCP와 카드사에서 공통적으로 관리하는 번호" })
    @IsString()
    @attribute()
    approval_no: string;

    @JSONSchema({ description: "" })
    @IsString()
    @attribute()
    business_no: string;

    @JSONSchema({ description: "할부 개월(0: 일시불)", format: "0~12" })
    @IsNumber()
    @attribute()
    quota: number;

    @JSONSchema({ description: "무이자 할부 결제 여부" })
    @IsBoolean()
    @attribute()
    is_interest_free: boolean;

    @JSONSchema({ description: "" })
    @IsString()
    @attribute()
    pg_tx_id: string;

    @rangeKey({ defaultProvider: () => new Date() })
    created_at?: Date;
}