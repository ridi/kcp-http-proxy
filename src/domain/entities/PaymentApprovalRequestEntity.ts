import { embed } from '@aws/dynamodb-data-mapper';
import { attribute, hashKey, table, versionAttribute } from '@aws/dynamodb-data-mapper-annotations';
import { PaymentApprovalResult } from '@root/domain/entities/PaymentApprovalResult';

export const TABLE_NAME = 't_payment_approval_requests';

@table(TABLE_NAME)
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
