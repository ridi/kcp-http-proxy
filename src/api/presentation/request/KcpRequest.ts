import { Matches } from "class-validator";
import { Mode } from "../../common/config";
import { ApiModelProperty } from "swagger-express-ts";

export abstract class KcpRequest {
    @ApiModelProperty({ description: "요청모드 dev/prd/ptx" })
    @Matches(/^(dev|prd|ptx){1}$/, {
        message: "mode가 올바르지 않습니다.\nmode는 dev(Development), prd(Production), ptx(Production-Tax Deduction) 중에 하나이어야 합니다."
    })
    mode: Mode;
}