import { ApiModel, ApiModelProperty } from "swagger-express-ts";
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

@ApiModel({
    description: "결제키 발급 요청 결과",
    name: "AuthKeyRequestResult"
})
export class AuthKeyRequestResult extends PayPlusResult {
    @ApiModelProperty({ description: "카드 발급사 코드" })
    readonly cardCode;
    @ApiModelProperty({ description: "카드 발급사 이름(한글)" })
    readonly cardName: string;
    @ApiModelProperty({ description: "" })
    readonly cardBankCode: string;
    @ApiModelProperty({ description: "" })
    readonly vanTxId: string;
    @ApiModelProperty({ description: "" })
    readonly cardBinType01: string;
    @ApiModelProperty({ description: "결제 요청 Key" })
    readonly batchKey: string;
    @ApiModelProperty({ description: "" })
    readonly joinCode: string;
    
    constructor(output: AuthKeyRequestOutput) {
        super(output.res_cd, output.res_msg);
        this.cardCode = output.card_cd;
        this.cardBankCode = output.card_bank_cd;
        this.vanTxId = output.van_tx_id;
        this.cardBinType01 = output.card_bin_type_01;
        this.batchKey = output.batch_key;
        this.joinCode = output.join_cd;
        this.cardName = output.card_name;
    }    
}