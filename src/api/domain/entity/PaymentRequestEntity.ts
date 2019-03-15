import { embed } from "@aws/dynamodb-data-mapper";
import { attribute, hashKey, table } from "@aws/dynamodb-data-mapper-annotations";
import { CommandType } from "../../application/command/CommandType";
import { PaymentApprovalResult } from "../result/PaymentApprovalResult";
import { PaymentAuthKeyResult } from "../result/PaymentAuthKeyResult";
import { PaymentCancellationResult } from "../result/PaymentCancellationResult";

@table("payment_requests")
export class PaymentRequestEntity {
    @hashKey()
    id: string;
    
    @attribute()
    command_type: CommandType;

    @attribute({ defaultProvider: () => new Date() })
    created_at: Date;

    @attribute()
    updated_at: Date;

    @attribute({ memberType: embed(PaymentAuthKeyResult) })
    auth_key_results?: Array<PaymentAuthKeyResult>;

    @attribute({ memberType: embed(PaymentApprovalResult) })
    approval_results?: Array<PaymentApprovalResult>;

    @attribute({ memberType: embed(PaymentCancellationResult) })
    cancellation_results?: Array<PaymentCancellationResult>;
}