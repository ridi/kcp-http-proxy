import { Column, Entity, ManyToOne } from "typeorm";
import { PaymentCancellationResultType } from "../result/PaymentCancellationResultType";
import { AbstractPaymentResultEntity } from "./AbstractPaymentResultEntity";
import { PaymentRequestEntity } from "./PaymentRequestEntity";

@Entity("t_payment_cancellation_results")
export class PaymentCancellationResultEntity extends AbstractPaymentResultEntity {
    static parse(result: PaymentCancellationResultType): PaymentCancellationResultEntity {
        const entity: PaymentCancellationResultEntity = new PaymentCancellationResultEntity();
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
        entity.mcht_taxno = result.mcht_taxno;
        entity.mall_taxno = result.mall_taxno;
        entity.ca_order_id = result.ca_order_id;
        entity.tno = result.tno;
        entity.amount = parseInt(result.amount || "0");
        entity.card_amount = parseInt(result.card_mny || "0");
        entity.coupon_amount = parseInt(result.coupon_mny || "0");
        entity.is_escrow = (result.escw_yn || "N") === "N";
        entity.cancel_gubun = result.canc_gubn;
        entity.van_code = result.van_cd;
        entity.app_time = result.app_time;
        entity.van_app_time = result.van_apptime;
        entity.cancel_time = result.canc_time;
        entity.app_no = result.app_no;
        entity.bizx_no = result.bizx_numb;
        entity.quota = parseInt(result.quota || "0");
        entity.is_interest_free = (result.noinf || "N") === "Y";
        entity.pg_txid = result.pg_txid;
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
    cancel_gubun: string;

    @Column({ nullable: true })
    van_code: string;

    @Column({ nullable: true })
    app_time: string;

    @Column({ nullable: true })
    van_app_time: string;

    @Column({ nullable: true })
    cancel_time: string;

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

    @ManyToOne(type => PaymentRequestEntity, request => request.cancel_results)
    request: PaymentRequestEntity;
}