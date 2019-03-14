import { attribute, hashKey, table } from "@aws/dynamodb-data-mapper-annotations";
import { CommandType } from "../../application/command/CommandType";
import { AbstractPaymentResult } from "../result/AbstractPaymentResult";

@table("payment_requests")
export class PaymentRequestEntity {
    @hashKey()
    id?: string;
    
    @attribute()
    command_type?: CommandType;

    @attribute({ defaultProvider: () => new Date() })
    created_at: Date;

    @attribute()
    updated_at: Date;

    @attribute()
    results?: Array<AbstractPaymentResult>;
}