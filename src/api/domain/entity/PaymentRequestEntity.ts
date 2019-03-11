import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { CommandType } from "/application/command/CommandType";
import { Mode } from "/common/config";
import { PaymentApprovalResultEntity } from "/domain/entity/PaymentApprovalResultEntity";
import { PaymentAuthKeyResultEntity } from "/domain/entity/PaymentAuthKeyResultEntity";
import { PaymentCancellationResultEntity } from "/domain/entity/PaymentCancellationResultEntity";

@Unique("uniq_payment_requests", [ "command_type", "mode", "hash" ])
@Entity("t_payment_requests")
export class PaymentRequestEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "enum", enum: CommandType })
    command_type: CommandType;

    @Column({ type: "enum", enum: Mode })
    mode: Mode;

    @Column()
    hash: string;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;

    @OneToMany(type => PaymentAuthKeyResultEntity, auth_key_result => auth_key_result.request, { eager: true })
    auth_key_results: PaymentAuthKeyResultEntity[];

    @OneToMany(type => PaymentApprovalResultEntity, approval_result => approval_result.request, { eager: true })
    approval_results: PaymentApprovalResultEntity[];

    @OneToMany(type => PaymentCancellationResultEntity, cancel_results => cancel_results.request, { eager: true })
    cancel_results: PaymentCancellationResultEntity[];
}