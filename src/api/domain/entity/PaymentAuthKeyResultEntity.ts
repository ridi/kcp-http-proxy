import { Column, Entity, ManyToOne } from "typeorm";
import { PaymentAuthKeyResultType } from "../result/PaymentAuthKeyResultType";
import { AbstractPaymentResultEntity } from "./AbstractPaymentResultEntity";
import { PaymentRequestEntity } from "./PaymentRequestEntity";

@Entity("t_payment_auth_key_results")
export class PaymentAuthKeyResultEntity extends AbstractPaymentResultEntity {
    static parse(result: PaymentAuthKeyResultType): PaymentAuthKeyResultEntity {
        const entity = new PaymentAuthKeyResultEntity();
        entity.code = result.res_cd;
        entity.message = result.res_msg;
        entity.card_code = result.card_cd;
        entity.van_tx_id = result.van_tx_id;
        entity.card_bin_type_01 = result.card_bin_type_01;
        entity.batch_key = result.batch_key;
        entity.join_code = result.join_cd;
        entity.card_name = result.card_name;
        return entity;
    }

    @Column({ nullable: true })
    card_code: string;
    
    @Column({ nullable: true })
    card_name: string;

    @Column({ nullable: true })
    card_bank_code: string;
    
    @Column({ nullable: true })
    van_tx_id: string;

    @Column({ nullable: true })
    card_bin_type_01: string;

    @Column({ nullable: true })
    batch_key: string;

    @Column({ nullable: true })
    join_code: string;

    @ManyToOne(type => PaymentRequestEntity, request => request.auth_key_results)
    request: PaymentRequestEntity;
}