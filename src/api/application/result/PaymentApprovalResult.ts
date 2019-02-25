import { IsBoolean, IsNumber, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { PayPlusResult } from "./PayPlusResult";

export type PaymentApprovalOutput = {
    res_cd: string,
    res_msg: string,
    res_en_msg: string,
    trace_no: string,
    pay_method: string,
    order_no: string,
    card_cd: string,
    card_name: string,
    acqu_cd: string,
    acqu_name: string,
    card_no: string,
    mcht_taxno: string,
    mall_taxno: string,
    ca_order_id: string,
    tno: string,
    amount: string,
    card_mny: string,
    coupon_mny: string,
    escw_yn: string,
    van_cd: string,
    app_time: string,
    van_apptime: string,
    app_no: string,
    bizx_numb: string,
    quota: string,
    noinf: string,
    pg_txid: string,
    res_tax_flag: string,
    res_tax_mny: string,
    res_free_mny: string,
    res_vat_mny: string,
    partcanc_yn: string,
    card_bin_type_01: string,
    card_bin_type_02: string,
    card_bin_bank_cd: string,
    join_cd: string
};

@JSONSchema({ description: "결제 요청 결과" })
export class PaymentApprovalResult extends PayPlusResult {
    @JSONSchema({ description: "영문 메시지" })
    @IsString()
    readonly english_message: string;

    @JSONSchema({ description: "KCP 결제 고유 번호" })
    @IsString()
    readonly trace_no: string;

    @JSONSchema({ description: "사용 결제 수단" })
    @IsString()
    readonly payment_method: string;

    @JSONSchema({ description: "가맹점 주문 번호" })
    @IsString()
    readonly order_no: string;
    
    @JSONSchema({ description: "카드 발급사 코드" })
    @IsString()
    readonly card_code: string;
    
    @JSONSchema({ description: "카드 이름" })
    @IsString()
    readonly card_name: string;
    
    @JSONSchema({ description: "카드 매입사 코드" })
    @IsString()
    readonly acquiredee_code: string;
    
    @JSONSchema({ description: "카드 매입사 이름", format: "한글" })
    @IsString()
    readonly acquiredee_name: string;
    
    @JSONSchema({ description: "카드 번호" })
    @IsString()
    readonly card_no: string;
    
    @JSONSchema({ description: "" })
    @IsString()
    readonly merchant_tax_no: string;
    
    @JSONSchema({ description: "가맹점 주문 번호??" })
    @IsString()
    readonly mall_tax_no: string;

    @JSONSchema({ description: "" })
    @IsString()
    readonly ca_order_id: string;
    
    @JSONSchema({ description: "KCP 거래 번호" })
    @IsString()
    readonly tno: string;
    
    @JSONSchema({ description: "총 결제 금액" })
    @IsNumber()
    readonly amount: number;
    
    @JSONSchema({ description: "카드 결제 금액" })
    @IsNumber()
    readonly card_amount: number;
    
    @JSONSchema({ description: "쿠폰 결제 금액" })
    @IsNumber()
    readonly coupon_amount: number;
    
    @JSONSchema({ description: "에스크로 사용 여부" })
    @IsBoolean()
    readonly is_escrow: boolean;

    @JSONSchema({ description: "VAN사 코드" })
    @IsString()
    readonly van_code: string;

    @JSONSchema({ description: "결제 승인 시각(공통)", format: "yyyyMMddHHmmss" })
    @IsString()
    readonly approval_time: string;

    @JSONSchema({ description: "VAN사 결제 승인 시각" })
    @IsString()
    readonly van_approval_time: string;

    @JSONSchema({ description: "정상 결제 거래의 승인 번호, KCP와 카드사에서 공통적으로 관리하는 번호" })
    @IsString()
    readonly approval_no: string;

    @JSONSchema({ description: "" })
    @IsString()
    readonly business_no: string;

    @JSONSchema({ description: "할부 개월(0: 일시불)", format: "0~12" })
    @IsNumber()
    readonly quota: number;

    @JSONSchema({ description: "무이자 할부 결제 여부" })
    @IsBoolean()
    readonly is_interest_free: boolean;

    @JSONSchema({ description: "" })
    @IsString()
    readonly pg_tx_id: string;

    @JSONSchema({ description: "가맹점에서 제공한 복합 과세 타입" })
    @IsString()
    readonly tax_flag: string;

    @JSONSchema({ description: "세액" })
    @IsNumber()
    readonly tax_amount: number;

    @JSONSchema({ description: "비과세액" })
    @IsNumber()
    readonly tax_free_amount: number;

    @JSONSchema({ description: "부가세액" })
    @IsNumber()
    readonly vat_amount: number;

    @JSONSchema({ description: "부분 취소 여부" })
    @IsBoolean()
    readonly is_partial_cancellation: boolean;

    @JSONSchema({ description: "" })
    @IsString()
    readonly card_bin_type_01: string;

    @JSONSchema({ description: "" })
    @IsString()
    readonly card_bin_type_02: string;

    @JSONSchema({ description: "" })
    @IsString()
    readonly card_bin_bank_code: string;

    @JSONSchema({ description: "" })
    @IsString()
    readonly join_code: string;
    
    constructor(output: PaymentApprovalOutput) {
        super(output.res_cd, output.res_msg);
        this.english_message = output.res_en_msg;
        this.trace_no = output.trace_no;
        this.payment_method = output.pay_method;
        this.order_no = output.order_no;
        this.card_code = output.card_cd;
        this.card_name = output.card_name;
        this.acquiredee_code = output.acqu_cd;
        this.acquiredee_name = output.acqu_name;
        this.card_no = output.card_no;
        this.merchant_tax_no = output.mcht_taxno;
        this.mall_tax_no = output.mall_taxno;
        this.ca_order_id = output.ca_order_id;
        this.tno = output.tno;
        this.amount = parseInt(output.amount || "0");
        this.card_amount = parseInt(output.card_mny || "0");
        this.coupon_amount = parseInt(output.coupon_mny || "0");
        this.is_escrow = (output.escw_yn || "N") === "N";
        this.van_code = output.van_cd;
        this.approval_time = output.app_time;
        this.van_approval_time = output.van_apptime;
        this.approval_no = output.app_no;
        this.business_no = output.bizx_numb;
        this.quota = parseInt(output.quota || "0");
        this.is_interest_free = (output.noinf || "N") === "Y";
        this.pg_tx_id = output.pg_txid;
        this.tax_flag = output.res_tax_flag;
        this.tax_amount = parseInt(output.res_tax_mny || "0");
        this.tax_free_amount = parseInt(output.res_free_mny || "0");
        this.vat_amount = parseInt(output.res_vat_mny || "0");
        this.is_partial_cancellation = (output.partcanc_yn || "N") === "Y";
        this.card_bin_type_01 = output.card_bin_type_01;
        this.card_bin_type_02 = output.card_bin_type_02;
        this.card_bin_bank_code = output.card_bin_bank_cd;
        this.join_code = output.join_cd;
    }
}