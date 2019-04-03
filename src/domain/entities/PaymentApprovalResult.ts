import { attribute, rangeKey } from '@aws/dynamodb-data-mapper-annotations';
import { RADIX } from '@root/common/constants';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

export interface PaymentApprovalResultType {
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
    card_no: string;
    mcht_taxno: string;
    mall_taxno: string;
    ca_order_id: string;
    tno: string;
    amount: string;
    card_mny: string;
    coupon_mny: string;
    escw_yn: string;
    van_cd: string;
    app_time: string;
    van_apptime: string;
    app_no: string;
    bizx_numb: string;
    quota: string;
    noinf: string;
    pg_txid: string;
    res_tax_flag: string;
    res_tax_mny: string;
    res_free_mny: string;
    res_vat_mny: string;
    partcanc_yn: string;
    card_bin_type_01: string;
    card_bin_type_02: string;
    card_bin_bank_cd: string;
    join_cd: string;
}

@JSONSchema({ description: '결제 요청 결과' })
export class PaymentApprovalResult {
    public static parse(output: PaymentApprovalResultType): PaymentApprovalResult {
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
        result.amount = parseInt(output.amount || '0', RADIX.DECIMAL) as number;
        result.card_amount = parseInt(output.card_mny || '0', RADIX.DECIMAL) as number;
        result.coupon_amount = parseInt(output.coupon_mny || '0', RADIX.DECIMAL) as number;
        result.is_escrow = (output.escw_yn || 'N') === 'Y';
        result.van_code = output.van_cd;
        result.approval_time = output.app_time;
        result.van_approval_time = output.van_apptime;
        result.approval_no = output.app_no;
        result.business_no = output.bizx_numb;
        result.quota = parseInt(output.quota || '0', RADIX.DECIMAL) as number;
        result.is_interest_free = (output.noinf || 'N') === 'Y';
        result.pg_tx_id = output.pg_txid;
        result.tax_flag = output.res_tax_flag;
        result.tax_amount = parseInt(output.res_tax_mny || '0', RADIX.DECIMAL) as number;
        result.tax_free_amount = parseInt(output.res_free_mny || '0', RADIX.DECIMAL) as number;
        result.vat_amount = parseInt(output.res_vat_mny || '0', RADIX.DECIMAL) as number;
        result.is_partial_cancel = (output.partcanc_yn || 'N') === 'Y';
        result.card_bin_type_01 = output.card_bin_type_01;
        result.card_bin_type_02 = output.card_bin_type_02;
        result.card_bin_bank_code = output.card_bin_bank_cd;
        result.join_code = output.join_cd;
        return result;
    }

    @JSONSchema({ description: 'KCP 결과 코드: 0000 (정상처리)' })
    @IsString()
    @attribute()
    public code: string;

    @JSONSchema({ description: 'KCP 결과 메시지' })
    @IsString()
    @attribute()
    public message: string;

    @JSONSchema({ description: '영문 메시지' })
    @IsString()
    @attribute()
    public en_message: string;

    @JSONSchema({ description: 'KCP 결제 고유 번호' })
    @IsString()
    @attribute()
    public trace_no: string;

    @JSONSchema({ description: '사용 결제 수단' })
    @IsString()
    @attribute()
    public pay_method: string;

    @JSONSchema({ description: '가맹점 주문 번호' })
    @IsString()
    @attribute()
    public order_no: string;

    @JSONSchema({ description: '카드 발급사 코드' })
    @IsString()
    @attribute()
    public card_code: string;

    @JSONSchema({ description: '카드 이름' })
    @IsString()
    @attribute()
    public card_name: string;

    @JSONSchema({ description: '카드 매입사 코드' })
    @IsString()
    @attribute()
    public acquirer_code: string;

    @JSONSchema({ description: '카드 매입사 이름', format: '한글' })
    @IsString()
    @attribute()
    public acquirer_name: string;

    @JSONSchema({ description: '카드 번호' })
    @IsString()
    @attribute()
    public card_no: string;

    @JSONSchema({ description: '' })
    @IsString()
    @attribute()
    public merchant_tax_no: string;

    @JSONSchema({ description: '가맹점 인증 번호' })
    @IsString()
    @attribute()
    public mall_tax_no: string;

    @JSONSchema({ description: '' })
    @IsString()
    @attribute()
    public ca_order_id: string;

    @JSONSchema({ description: 'KCP 거래 번호' })
    @IsString()
    @attribute()
    public tno: string;

    @JSONSchema({ description: '총 결제 금액' })
    @IsNumber()
    @attribute()
    public amount: number;

    @JSONSchema({ description: '카드 결제 금액' })
    @IsNumber()
    @attribute()
    public card_amount: number;

    @JSONSchema({ description: '쿠폰 결제 금액' })
    @IsNumber()
    @attribute()
    public coupon_amount: number;

    @JSONSchema({ description: '에스크로 사용 여부' })
    @IsBoolean()
    @attribute()
    public is_escrow: boolean;

    @JSONSchema({ description: 'VAN사 코드' })
    @IsString()
    @attribute()
    public van_code: string;

    @JSONSchema({ description: '결제 승인 시각(공통)', format: 'yyyyMMddHHmmss' })
    @IsString()
    @attribute()
    public approval_time: string;

    @JSONSchema({ description: 'VAN사 결제 승인 시각' })
    @IsString()
    @attribute()
    public van_approval_time: string;

    @JSONSchema({ description: '정상 결제 거래의 승인 번호, KCP와 카드사에서 공통적으로 관리하는 번호' })
    @IsString()
    @attribute()
    public approval_no: string;

    @JSONSchema({ description: '' })
    @IsString()
    @attribute()
    public business_no: string;

    @JSONSchema({ description: '할부 개월(0: 일시불)', format: '0~12' })
    @IsNumber()
    @attribute()
    public quota: number;

    @JSONSchema({ description: '무이자 할부 결제 여부' })
    @IsBoolean()
    @attribute()
    public is_interest_free: boolean;

    @JSONSchema({ description: '' })
    @IsString()
    @attribute()
    public pg_tx_id: string;

    @JSONSchema({ description: '가맹점에서 제공한 복합 과세 타입' })
    @IsString()
    @attribute()
    public tax_flag: string;

    @JSONSchema({ description: '세액' })
    @IsNumber()
    @attribute()
    public tax_amount: number;

    @JSONSchema({ description: '비과세액' })
    @IsNumber()
    @attribute()
    public tax_free_amount: number;

    @JSONSchema({ description: '부가세액' })
    @IsNumber()
    @attribute()
    public vat_amount: number;

    @JSONSchema({ description: '부분 취소 여부' })
    @IsBoolean()
    @attribute()
    public is_partial_cancel: boolean;

    @JSONSchema({ description: '' })
    @IsString()
    @attribute()
    public card_bin_type_01: string;

    @JSONSchema({ description: '' })
    @IsString()
    @attribute()
    public card_bin_type_02: string;

    @JSONSchema({ description: '' })
    @IsString()
    @attribute()
    public card_bin_bank_code: string;

    @JSONSchema({ description: '' })
    @IsString()
    @attribute()
    public join_code: string;

    @rangeKey({ defaultProvider: () => new Date() })
    public readonly created_at?: Date;
}
