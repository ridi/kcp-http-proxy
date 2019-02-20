import { ApiModelProperty } from "swagger-express-ts";
import { PayPlusStatus } from "../../common/constants";

export abstract class PayPlusResult {
    @ApiModelProperty({ description: "KCP 결과 코드: 0000 (정상처리)" })
    readonly code: string;

    @ApiModelProperty({ description: "KCP 결과 메시지" })
    readonly messsage: string | object;

    @ApiModelProperty({ description: "KCP 결과 성공 여부" })
    readonly isSuccess: boolean;
    
    constructor(res_cd: string, res_msg: string | object) {
        this.code = res_cd;
        this.messsage = res_msg;
        this.isSuccess = this.code === PayPlusStatus.OK;
    }
}