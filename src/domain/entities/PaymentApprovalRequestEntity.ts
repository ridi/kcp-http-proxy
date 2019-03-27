import { embed } from '@aws/dynamodb-data-mapper';
import { attribute, hashKey, table, versionAttribute } from '@aws/dynamodb-data-mapper-annotations';
import { PaymentApprovalResult } from '@root/domain/entities/PaymentApprovalResult';

export const TABLE_NAME = 't_payment_approval_requests';

@table(TABLE_NAME)
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