import { PayPlusStatus } from "@/common/constants";
import { PaymentAuthKeyResultType } from "@/domain/result/PaymentAuthKeyResultType";
import { IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { AbstractPaymentResult } from "./AbstractPaymentResult";
import { attribute } from "@aws/dynamodb-data-mapper-annotations";

@JSONSchema({ description: "결제키 발급 요청 결과" })
export class PaymentAuthKeyResult extends AbstractPaymentResult {
    static parse(output: PaymentAuthKeyResultType): PaymentAuthKeyResult {
        const result = new PaymentAuthKeyResult();
        result.code = output.res_cd;
        result.message = output.res_msg;
        result.card_code = output.card_cd;
        result.van_tx_id = output.van_tx_id;
        result.card_bin_type_01 = output.card_bin_type_01;
        result.batch_key = output.batch_key;
        result.join_code = output.join_cd;
        result.card_name = output.card_name;
        result.is_success = result.code === PayPlusStatus.OK;
        return result;
    }

    @JSONSchema({ description: "카드 발급사 코드" })
    @IsString()
    @attribute()
    card_code: string;
    
    @JSONSchema({ description: "카드 발급사 이름", format: "한글" })
    @IsString()
    @attribute()
    card_name: string;

    @JSONSchema({ description: "카드 발급사 은행 코드" })
    @IsString()
    @attribute()
    card_bank_code: string;
    
    @JSONSchema({ description: "VAN사 거래 번호" })
    @IsString()
    @attribute()
    van_tx_id: string;

    @JSONSchema({ description: "" })
    @IsString()
    @attribute()
    card_bin_type_01: string;

    @JSONSchema({ description: "결제 요청 Key(Batch/Billing Key)" })
    @IsString()
    @attribute()
    batch_key: string;

    @JSONSchema({ description: "" })
    @IsString()
    @attribute()
    join_code: string;
}