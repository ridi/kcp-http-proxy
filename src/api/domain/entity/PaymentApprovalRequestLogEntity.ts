import { Entity, PrimaryGeneratedColumn, Column, Unique, JoinColumn, OneToOne, OneToMany } from "typeorm";
import { PaymentApprovalResultLogEntity } from "./PaymentApprovalResultLogEntity";

@Unique("uniq_payment_approval_request_logs", [ "bill_key", "order_no", "product_amount" ])
@Entity("t_kcp_payment_approval_request_logs")
export class PaymentApprovalRequestLogEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    bill_key: string;

    @Column()
    order_no: string;

    @Column()
    product_amount: number;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created: Date;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated: Date;

    @OneToMany(() => PaymentApprovalResultLogEntity, (result)=>result.request, { eager: true })
    results: PaymentApprovalResultLogEntity[];
}