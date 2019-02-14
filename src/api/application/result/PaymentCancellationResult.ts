import { ApiModel, ApiModelProperty } from "swagger-express-ts";
import { PayPlusResult } from "./PayPlusResult";

export type PaymentCancellationOutput = {
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

@ApiModel({ description: "KCP 결제 취소 결과" })
export class PaymentCancellationResult extends PayPlusResult {
    @ApiModelProperty({ description: "영문메시지" })
    readonly englishMessage: string;

    @ApiModelProperty({ description: "" })
    readonly traceNo: string;

    @ApiModelProperty({ description: "결제수단" })
    readonly paymentMethod: string;

    @ApiModelProperty({ description: "가맹점 주문 번호" })
    readonly orderNo: string;
    
    @ApiModelProperty({ description: "카드 발급사 코드" })
    readonly cardCode: string;
    
    @ApiModelProperty({ description: "카드 발급사 이름" })
    readonly cardName: string;
    
    @ApiModelProperty({ description: "카드 매입사 코드" })
    readonly acquiredeeCode: string;//
    
    @ApiModelProperty({ description: "카드 매입사 이름: 한글" })
    readonly acquiredeeName: string;//
    
    @ApiModelProperty({ description: "" })
    readonly cardNo: string;
    
    @ApiModelProperty({ description: "" })
    readonly mechantTaxNo: string;
    
    @ApiModelProperty({ description: "가맹점 주문번호??" })
    readonly mallTaxNo: string;

    @ApiModelProperty({ description: "" })
    readonly caOrderId: string;
    
    @ApiModelProperty({ description: "결제 완료 후 결제 건에 대한 고유 값: 결제 건 취소 시 이용" })
    readonly tno: string;
    
    @ApiModelProperty({ description: "총 결제 금액" })
    readonly amount: number;
    
    @ApiModelProperty({ description: "카드 결제 금액" })
    readonly cardAmount: number;
    
    @ApiModelProperty({ description: "쿠폰 결제 금액" })
    readonly couponAmount: number;
    
    @ApiModelProperty({ description: "" })
    readonly escrowUse: boolean;

    @ApiModelProperty({ description: "매입 취소/승인 취소의 구분값" })
    readonly cancellationGubun: string;

    @ApiModelProperty({ description: "" })
    readonly vanCode: string;

    @ApiModelProperty({ description: "결제승인시각(yyyyMMddHHmmss)" })
    readonly approvalTime: string;//

    @ApiModelProperty({ description: "VAN 결제승인시각(yyyyMMddHHmmss)" })
    readonly vanApprovalTime: string;

    @ApiModelProperty({ description: "결제취소시각(yyyyMMddHHmmss)" })
    readonly cancellationTime: string;

    @ApiModelProperty({ description: "정상 결제 거래의 승인 번호: KCP와 카드사에서 공통적으로 관리하는 번호" })
    readonly approvalNo: string;

    @ApiModelProperty({ description: "" })
    readonly businessNo: string;

    @ApiModelProperty({ description: "할부 개월 수(0 ~ 12, 0: 일시불)" })
    readonly quota: number;

    @ApiModelProperty({ description: "무이자 할부 결제 여부" })
    readonly isInterestFreeMonthlyInstallments: boolean;

    @ApiModelProperty({ description: "" })
    readonly pgTxId: string;

    constructor(output: PaymentCancellationOutput) {
        super(output.res_cd, output.res_msg);
        this.englishMessage = output.res_en_msg;
        this.traceNo = output.trace_no;
        this.paymentMethod = output.pay_method;
        this.orderNo = output.order_no;
        this.cardCode = output.card_cd;
        this.cardName = output.card_name;
        this.acquiredeeCode = output.acqu_cd;
        this.acquiredeeName = output.acqu_name;
        this.mechantTaxNo = output.mcht_taxno;
        this.mallTaxNo = output.mall_taxno;
        this.caOrderId = output.ca_order_id;
        this.tno = output.tno;
        this.amount = parseInt(output.amount || "0");
        this.cardAmount = parseInt(output.card_mny || "0");
        this.couponAmount = parseInt(output.coupon_mny || "0");
        this.escrowUse = (output.escw_yn || "N") === "N";
        this.cancellationGubun = output.canc_gubn;
        this.vanCode = output.van_cd;
        this.approvalTime = output.app_time;
        this.vanApprovalTime = output.van_apptime;
        this.cancellationTime = output.canc_time;
        this.approvalNo = output.app_no;
        this.businessNo = output.bizx_numb;
        this.quota = parseInt(output.quota || "0");
        this.isInterestFreeMonthlyInstallments = (output.noinf || "N") === "Y";
        this.pgTxId = output.pg_txid;
    }
}