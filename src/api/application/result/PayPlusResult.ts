import { JSONSchema } from "class-validator-jsonschema";
import { PayPlusStatus } from "../../common/constants";

export abstract class PayPlusResult {
    @JSONSchema({ description: "KCP 결과 코드: 0000 (정상처리)" })
    readonly code: string;

    @JSONSchema({ description: "KCP 결과 메시지" })
    readonly message: string;

    @JSONSchema({ description: "KCP 결과 성공 여부" })
    readonly is_success: boolean;
    
    constructor(res_cd: string, res_msg: string) {
        this.code = res_cd;
        this.message = res_msg;
        this.is_success = this.code === PayPlusStatus.OK;
    }
}