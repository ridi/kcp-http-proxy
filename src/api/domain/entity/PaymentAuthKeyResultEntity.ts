import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, AfterLoad } from "typeorm";
import { PayPlusStatus } from "../../common/constants";
import { AbstractPaymentResultEntity } from "../../domain/entity/AbstractPaymentResultEntity";
import { PaymentRequestEntity } from "../../domain/entity/PaymentRequestEntity";
import { PaymentAuthKeyResultType } from "../../domain/result/PaymentAuthKeyResultType";

@Entity("t_payment_auth_key_results")
export class PaymentAuthKeyResultEntity {
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
        entity.is_success = entity.code === PayPlusStatus.OK;
        return entity;
    }

    @PrimaryGeneratedColumn()
    id: number;    
    
    @Column()
    code: string;
    
    @Column({ type: "text" })
    message: string;
    
    @Column()
    is_success: boolean;
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

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;

    @ManyToOne(type => PaymentRequestEntity, request => request.auth_key_results, { lazy: true })
    request: PaymentRequestEntity;

    @AfterLoad()
    loadAfter() {
        this.request = null;
    }
}