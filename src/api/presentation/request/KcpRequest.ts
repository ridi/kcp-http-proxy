import { Matches } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { Mode } from "../../common/config";

export abstract class KcpRequest {
    @JSONSchema({ description: "요청모드", examples: [ "dev", "prd", "ptx" ] })
    @Matches(/^(dev|prd|ptx){1}$/, {
        message: "mode가 올바르지 않습니다.\nmode는 dev(Development), prd(Production), ptx(Production-Tax Deduction) 중에 하나이어야 합니다."
    })
    mode: Mode;
}