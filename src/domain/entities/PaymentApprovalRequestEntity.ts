import { embed } from '@aws/dynamodb-data-mapper';
import { attribute, hashKey, table, versionAttribute } from '@aws/dynamodb-data-mapper-annotations';
import { PaymentApprovalResult } from '@root/domain/entities/PaymentApprovalResult';

@table('payment_approval_requests')
export class PaymentApprovalRequestEntity {
    @hashKey()
    id: string;
    
    @attribute()
    siteCode: string;

    @attribute({ defaultProvider: () => new Date() })
    createdAt: Date;

    @attribute()
    updatedAt: Date;

    @attribute({ memberType: embed(PaymentApprovalResult) })
    results?: Array<PaymentApprovalResult>;

    @versionAttribute()
    version: number;
}