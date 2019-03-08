import { IsBoolean, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";

@JSONSchema({ description: "결제키 발급 요청 결과" })
export class PaymentAuthKeyResultDto {
    @JSONSchema({ description: "KCP 결과 코드: 0000 (정상처리)" })
    @IsString()
    code: string;

    @JSONSchema({ description: "KCP 결과 메시지" })
    @IsString()
    message: string;

    @JSONSchema({ description: "KCP 결과 성공 여부" })
    @IsBoolean()
    is_success: boolean;

    @JSONSchema({ description: "카드 발급사 코드" })
    @IsString()
    card_code: string;
    
    @JSONSchema({ description: "카드 발급사 이름", format: "한글" })
    @IsString()
    card_name: string;

    @JSONSchema({ description: "카드 발급사 은행 코드" })
    @IsString()
    card_bank_code: string;
    
    @JSONSchema({ description: "VAN사 거래 번호" })
    @IsString()
    van_tx_id: string;

    @JSONSchema({ description: "" })
    @IsString()
    card_bin_type_01: string;

    @JSONSchema({ description: "결제 요청 Key(Batch/Billing Key)" })
    @IsString()
    batch_key: string;

    @JSONSchema({ description: "" })
    @IsString()
    join_code: string;
}