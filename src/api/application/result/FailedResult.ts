import { PayPlusResult } from "./PayPlusResult";
import { ApiModel } from "swagger-express-ts";

@ApiModel({ description: "KCP 처리 실패 결과" })
export class FailedResult extends PayPlusResult {
    constructor(res_cd: string, res_msg: string | object) {
        super(res_cd, res_msg);
    }
}