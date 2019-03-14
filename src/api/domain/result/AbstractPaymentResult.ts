import { IsBoolean, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { rangeKey, attribute } from "@aws/dynamodb-data-mapper-annotations";

export abstract class AbstractPaymentResult {
    @JSONSchema({ description: "KCP 결과 코드: 0000 (정상처리)" })
    @IsString()
    @attribute()
    code: string;

    @JSONSchema({ description: "KCP 결과 메시지" })
    @IsString()
    @attribute()
    message: string;

    @JSONSchema({ description: "KCP 결과 성공 여부" })
    @IsBoolean()
    @attribute()
    is_success: boolean;

    @rangeKey({ defaultProvider: () => new Date() })
    created_at?: Date;
}