import { Column, Entity, ManyToOne } from "typeorm";
import { PaymentApprovalRequestLogEntity } from "./PaymentApprovalRequestLogEntity";

@Entity("t_kcp_payment_approval_result_logs")
export class PaymentApprovalResultLogEntity {
    @ManyToOne(() => PaymentApprovalRequestLogEntity, (request) => request.results)
    request: PaymentApprovalRequestLogEntity;

    @Column({ nullable: true })
    code: string;

    @Column({ nullable: true })
    message: string;

    @Column({ nullable: true })
    is_success: boolean;

    @Column({ nullable: true })
    english_message: string;

    @Column({ nullable: true })
    trace_no: string;

    @Column({ nullable: true })
    payment_method: string;

    @Column({ nullable: true })
    order_no: string;
    
    @Column({ nullable: true })
    card_code: string;
    
    @Column({ nullable: true })
    card_name: string;
    
    @Column({ nullable: true })
    acquiredee_code: string;
    
    @Column({ nullable: true })
    acquiredee_name: string;
    
    @Column({ nullable: true })
    card_no: string;
    
    @Column({ nullable: true })
    merchant_tax_no: string;
    
    @Column({ nullable: true })
    mall_tax_no: string;

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
    approval_time: string;

    @Column({ nullable: true })
    van_approval_time: string;

    @Column({ nullable: true })
    approval_no: string;

    @Column({ nullable: true })
    business_no: string;

    @Column({ nullable: true })
    quota: number;

    @Column({ nullable: true })
    is_interest_free: boolean;

    @Column({ nullable: true })
    pg_tx_id: string;

    @Column({ nullable: true })
    tax_flag: string;

    @Column({ nullable: true })
    tax_amount: number;

    @Column({ nullable: true })
    tax_free_amount: number;

    @Column({ nullable: true })
    vat_amount: number;

    @Column({ nullable: true })
    is_partial_cancellation: boolean;

    @Column({ nullable: true })
    card_bin_type_01: string;

    @Column({ nullable: true })
    card_bin_type_02: string;

    @Column({ nullable: true })
    card_bin_bank_code: string;

    @Column({ nullable: true })
    join_code: string;
}