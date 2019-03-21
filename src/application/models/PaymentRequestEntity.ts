import { embed } from "@aws/dynamodb-data-mapper";
import { attribute, hashKey, table } from "@aws/dynamodb-data-mapper-annotations";
import { PaymentApprovalResult } from "@root/application/models/PaymentApprovalResult";
import { PaymentAuthKeyResult } from "@root/application/models/PaymentAuthKeyResult";
import { PaymentCancellationResult } from "@root/application/models/PaymentCancellationResult";

@table("payment_requests")
export class PaymentRequestEntity {
    @hashKey()
    id: string;
    
    @attribute()
    site_code: string;

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