import { Entity, Column, PrimaryGeneratedColumn, Unique } from "typeorm";
import { CommandType } from "../../application/command/CommandType";

@Unique("uniq_payment_requests", [ "command_type", "hash" ])
@Entity("t_payment_requests")
export class PaymentRequestEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "enum", enum: CommandType })
    command_type: CommandType;

    @Column()
    hash: string;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;
}