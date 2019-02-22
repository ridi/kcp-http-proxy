import { IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { PayPlusResult } from "./PayPlusResult";

export type AuthKeyRequestOutput = {
    res_cd: string,
    res_msg: string,
    card_cd: string,
    card_bank_cd: string, 
    van_tx_id: string,
    card_bin_type_01: string,
    batch_key: string,
    join_cd: string,
    card_name: string
};

@JSONSchema({ description: "결제키 발급 요청 결과" })
export class AuthKeyRequestResult extends PayPlusResult {
    @JSONSchema({ description: "카드 발급사 코드" })
    @IsString()
    readonly card_code: string;
    
    @JSONSchema({ description: "카드 발급사 이름", format: "한글" })
    @IsString()
    readonly card_name: string;

    @JSONSchema({ description: "카드 발급사 은행 코드" })
    @IsString()
    readonly card_bank_code: string;
    
    @JSONSchema({ description: "VAN사 거래 번호" })
    @IsString()
    readonly van_tx_id: string;

    @JSONSchema({ description: "" })
    @IsString()
    readonly card_bin_type_01: string;

    @JSONSchema({ description: "결제 요청 Key(Batch/Billing Key)" })
    @IsString()
    readonly batch_key: string;

    @JSONSchema({ description: "" })
    @IsString()
    readonly join_code: string;
    
    constructor(output: AuthKeyRequestOutput) {
        super(output.res_cd, output.res_msg);
        this.card_code = output.card_cd;
        this.card_bank_code = output.card_bank_cd;
        this.van_tx_id = output.van_tx_id;
        this.card_bin_type_01 = output.card_bin_type_01;
        this.batch_key = output.batch_key;
        this.join_code = output.join_cd;
        this.card_name = output.card_name;
    }    
}