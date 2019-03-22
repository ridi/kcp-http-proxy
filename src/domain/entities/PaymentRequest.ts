import { embed } from '@aws/dynamodb-data-mapper';
import { attribute, hashKey, table } from '@aws/dynamodb-data-mapper-annotations';
import { PaymentApprovalResult } from '@root/domain/entities/PaymentApprovalResult';
import { PaymentBatchKeyResult } from '@root/domain/entities/PaymentBatchKeyResult';
import { PaymentCancellationResult } from '@root/domain/entities/PaymentCancellationResult';

@table('payment_requests')
export class PaymentRequest {
    @hashKey()
    id: string;
    
    @attribute()
    site_code: string;

    @attribute({ defaultProvider: () => new Date() })
    created_at: Date;

    @attribute()
    updated_at: Date;

    @attribute({ memberType: embed(PaymentBatchKeyResult) })
    batch_key_results?: Array<PaymentBatchKeyResult>;

    @attribute({ memberType: embed(PaymentApprovalResult) })
    approval_results?: Array<PaymentApprovalResult>;

    @attribute({ memberType: embed(PaymentCancellationResult) })
    cancellation_results?: Array<PaymentCancellationResult>;
}