import { DataMapper, ItemNotFoundException } from '@aws/dynamodb-data-mapper';
import { AttributePath, FunctionExpression } from '@aws/dynamodb-expressions';
import { PaymentApprovalRequestEntity } from '@root/domain/entities/PaymentApprovalRequestEntity';
import { PaymentApprovalResult } from '@root/domain/entities/PaymentApprovalResult';
import { Inject, Service } from 'typedi';

@Service()
export class PaymentApprovalRequestRepository {
    @Inject((type) => DataMapper)
    private mapper: DataMapper;

    public async getPaymentApprovalRequestById(id: string): Promise<PaymentApprovalRequestEntity | null> {
        return this.mapper.get(Object.assign(new PaymentApprovalRequestEntity(), { id })).then((fetched) => {
                return fetched;
            }).catch((err) => {
                if (err.name === ItemNotFoundException.name) {
                    return null;
                }
                throw err;
            });
    }

    public async createPaymentApprovalRequest(id: string, ttl: number): Promise<PaymentApprovalRequestEntity> {
        return await this.mapper.put(
            Object.assign(new PaymentApprovalRequestEntity(), { id, ttl }),
            { condition: new FunctionExpression('attribute_not_exists', new AttributePath('id')) },
        );
    }

    public async updatePaymentApprovalRequest(id: string, paymentApprovalResult: PaymentApprovalResult) {
        const paymentApprovalRequest = await this.getPaymentApprovalRequestById(id);
        if (paymentApprovalRequest === null) {
            throw new Error('PaymentApprovalRequest is not found');
        }

        paymentApprovalRequest.result = paymentApprovalResult;
        await this.mapper.update(paymentApprovalRequest);
    }

    public async deletePaymentApprovalRequest(id: string) {
        await this.mapper.delete(Object.assign(new PaymentApprovalRequestEntity(), { id }));
    }
}
