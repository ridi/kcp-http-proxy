import { Column, Entity, ManyToOne } from "typeorm";
import { AbstractPaymentResultEntity } from "/domain/entity/AbstractPaymentResultEntity";
import { PaymentRequestEntity } from "/domain/entity/PaymentRequestEntity";
import { PaymentApprovalResultType } from "/domain/result/PaymentApprovalResultType";
import { PayPlusStatus } from "/common/constants";

@Entity("t_payment_approval_results")
export class PaymentApprovalResultEntity extends AbstractPaymentResultEntity {
    static parse(result: PaymentApprovalResultType): PaymentApprovalResultEntity {
        const entity: PaymentApprovalResultEntity = new PaymentApprovalResultEntity();
        entity.code = result.res_cd;
        entity.message = result.res_msg;
        entity.en_message = result.res_en_msg;
        entity.trace_no = result.trace_no;
        entity.pay_method = result.pay_method;
        entity.order_no = result.order_no;
        entity.card_code = result.card_cd;
        entity.card_name = result.card_name;
        entity.acqu_code = result.acqu_cd;
        entity.acqu_name = result.acqu_name;
        entity.card_no = result.card_no;
        entity.mcht_taxno = result.mcht_taxno;
        entity.mall_taxno = result.mall_taxno;
        entity.ca_order_id = result.ca_order_id;
        entity.tno = result.tno;
        entity.amount = parseInt(result.amount || "0");
        entity.card_amount = parseInt(result.card_mny || "0");
        entity.coupon_amount = parseInt(result.coupon_mny || "0");
        entity.is_escrow = (result.escw_yn || "N") === "N";
        entity.van_code = result.van_cd;
        entity.app_time = result.app_time;
        entity.van_app_time = result.van_apptime;
        entity.app_no = result.app_no;
        entity.bizx_no = result.bizx_numb;
        entity.quota = parseInt(result.quota || "0");
        entity.is_interest_free = (result.noinf || "N") === "Y";
        entity.pg_txid = result.pg_txid;
        entity.tax_flag = result.res_tax_flag;
        entity.tax_amount = parseInt(result.res_tax_mny || "0");
        entity.tax_free_amount = parseInt(result.res_free_mny || "0");
        entity.vat_amount = parseInt(result.res_vat_mny || "0");
        entity.is_partial_cancel = (result.partcanc_yn || "N") === "Y";
        entity.card_bin_type_01 = result.card_bin_type_01;
        entity.card_bin_type_02 = result.card_bin_type_02;
        entity.card_bin_bank_code = result.card_bin_bank_cd;
        entity.join_code = result.join_cd;
        entity.is_success = entity.code === PayPlusStatus.OK;
        return entity;
    }

    @Column({ nullable: true })
    en_message: string;

    @Column({ nullable: true })
    trace_no: string;

    @Column({ nullable: true })
    pay_method: string;

    @Column({ nullable: true })
    order_no: string;

    @Column({ nullable: true })
    card_code: string;

    @Column({ nullable: true })
    card_name: string;

    @Column({ nullable: true })
    acqu_code: string;

    @Column({ nullable: true })
    acqu_name: string;

    @Column({ nullable: true })
    card_no: string;

    @Column({ nullable: true })
    mcht_taxno: string;

    @Column({ nullable: true })
    mall_taxno: string;

    @Column({ nullable: true })
    ca_order_id: string;

    @Column({ nullable: true })
    tno: string;

    @Column({ nullable: true })
    amount: number;

    @Column({ nullable: true })
    card_amount: number;

    @Column({ nullable: true })
    coupon_amount: number;

    @Column({ nullable: true })
    is_escrow: boolean;

    @Column({ nullable: true })
    van_code: string;

    @Column({ nullable: true })
    app_time: string;

    @Column({ nullable: true })
    van_app_time: string;

    @Column({ nullable: true })
    app_no: string;

    @Column({ nullable: true })
    bizx_no: string;

    @Column({ nullable: true })
    quota: number;

    @Column({ nullable: true })
    is_interest_free: boolean;

    @Column({ nullable: true })
    pg_txid: string;

    @Column({ nullable: true })
    tax_flag: string;

    @Column({ nullable: true })
    tax_amount: number;

    @Column({ nullable: true })
    tax_free_amount: number;

    @Column({ nullable: true })
    vat_amount: number;

    @Column({ nullable: true })
    is_partial_cancel: boolean;

    @Column({ nullable: true })
    card_bin_type_01: string;

    @Column({ nullable: true })
    card_bin_type_02: string;

    @Column({ nullable: true })
    card_bin_bank_code: string;

    @Column({ nullable: true })
    join_code: string;

    @ManyToOne(type => PaymentRequestEntity, request => request.approval_results)
    request: PaymentRequestEntity;
}