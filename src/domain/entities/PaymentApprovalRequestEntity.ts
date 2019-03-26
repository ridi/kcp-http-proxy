import { embed } from '@aws/dynamodb-data-mapper';
import { attribute, hashKey, table } from '@aws/dynamodb-data-mapper-annotations';
import { PaymentApprovalResult } from '@root/domain/entities/PaymentApprovalResult';

@table('payment_approval_requests')
export class PaymentApprovalRequestEntity {
    @hashKey()
    id: string;
    
    @attribute()
    site_code: string;

    @attribute({ defaultProvider: () => new Date() })
    created_at: Date;

    @attribute()
    updated_at: Date;

    @attribute({ memberType: embed(PaymentApprovalResult) })
    results?: Array<PaymentApprovalResult>;
}