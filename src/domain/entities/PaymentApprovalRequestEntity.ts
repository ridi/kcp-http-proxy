import { attribute, hashKey, table, versionAttribute } from '@aws/dynamodb-data-mapper-annotations';
import { PaymentApprovalResult } from '@root/domain/entities/PaymentApprovalResult';
import { KCP_PAYMENT_APPROVAL_REQUEST_TABLE } from '@root/common/constants';

@table(KCP_PAYMENT_APPROVAL_REQUEST_TABLE)
export class PaymentApprovalRequestEntity {
    @hashKey()
    public id: string;

    @attribute({ defaultProvider: () => new Date() })
    public createdAt: Date;

    @attribute()
    public result: PaymentApprovalResult | null;

    @attribute()
    public ttl: number;

    @versionAttribute()
    public version: number;
}
