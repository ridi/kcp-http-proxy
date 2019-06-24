import { embed } from '@aws/dynamodb-data-mapper';
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
    public updatedAt: Date;

    @attribute({ memberType: embed(PaymentApprovalResult) })
    public results?: PaymentApprovalResult[];

    @versionAttribute()
    public version: number;
}
