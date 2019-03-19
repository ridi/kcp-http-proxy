import { PaymentApprovalResultType } from "@app/domain/result/PaymentApprovalResultType";
import { attribute, rangeKey } from "@aws/dynamodb-data-mapper-annotations";
import { IsBoolean, IsNumber, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";

@JSONSchema({ description: "결제 요청 결과" })
export class PaymentApprovalResult {
    static parse(output: PaymentApprovalResultType): PaymentApprovalResult {
        const result: PaymentApprovalResult = new PaymentApprovalResult();
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
        result.card_no = output.card_no;
        result.merchant_tax_no = output.mcht_taxno;
        result.mall_tax_no = output.mall_taxno;
        result.ca_order_id = output.ca_order_id;
        result.tno = output.tno;
        result.amount = parseInt(output.amount || "0") as number;
        result.card_amount = <number>parseInt(output.card_mny || "0");
        result.coupon_amount = <number>parseInt(output.coupon_mny || "0");
        result.is_escrow = (output.escw_yn || "N") === "Y";
        result.van_code = output.van_cd;
        result.approval_time = output.app_time;
        result.van_approval_time = output.van_apptime;
        result.approval_no = output.app_no;
        result.business_no = output.bizx_numb;
        result.quota = <number>parseInt(output.quota || "0");
        result.is_interest_free = (output.noinf || "N") === "Y";
        result.pg_tx_id = output.pg_txid;
        result.tax_flag = output.res_tax_flag;
        result.tax_amount = <number>parseInt(output.res_tax_mny || "0");
        result.tax_free_amount = <number>parseInt(output.res_free_mny || "0");
        result.vat_amount = <number>parseInt(output.res_vat_mny || "0");
        result.is_partial_cancel = (output.partcanc_yn || "N") === "Y";
        result.card_bin_type_01 = output.card_bin_type_01;
        result.card_bin_type_02 = output.card_bin_type_02;
        result.card_bin_bank_code = output.card_bin_bank_cd;
        result.join_code = output.join_cd;
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

    @JSONSchema({ description: "가맹점에서 제공한 복합 과세 타입" })
    @IsString()
    @attribute()
    tax_flag: string;

    @JSONSchema({ description: "세액" })
    @IsNumber()
    @attribute()
    tax_amount: number;

    @JSONSchema({ description: "비과세액" })
    @IsNumber()
    @attribute()
    tax_free_amount: number;

    @JSONSchema({ description: "부가세액" })
    @IsNumber()
    @attribute()
    vat_amount: number;

    @JSONSchema({ description: "부분 취소 여부" })
    @IsBoolean()
    @attribute()
    is_partial_cancel: boolean;

    @JSONSchema({ description: "" })
    @IsString()
    @attribute()
    card_bin_type_01: string;

    @JSONSchema({ description: "" })
    @IsString()
    @attribute()
    card_bin_type_02: string;

    @JSONSchema({ description: "" })
    @IsString()
    @attribute()
    card_bin_bank_code: string;

    @JSONSchema({ description: "" })
    @IsString()
    @attribute()
    join_code: string;

    @rangeKey({ defaultProvider: () => new Date() })
    created_at?: Date;
}