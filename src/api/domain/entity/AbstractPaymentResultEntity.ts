import { JSONSchema } from "class-validator-jsonschema";
import { Column, PrimaryGeneratedColumn } from "typeorm";

export abstract class AbstractPaymentResultEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    @JSONSchema({ description: "KCP 결과 코드: 0000 (정상처리)" })
    @Column()
    code: string;

    @JSONSchema({ description: "KCP 결과 메시지" })
    @Column({ type: "text" })
    message: string;

    @JSONSchema({ description: "KCP 결과 성공 여부" })
    @Column()
    is_success: boolean;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;
}