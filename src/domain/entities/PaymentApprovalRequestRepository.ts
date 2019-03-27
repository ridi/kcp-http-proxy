import { DataMapper, ItemNotFoundException } from '@aws/dynamodb-data-mapper';
import { PaymentApprovalRequestEntity } from '@root/domain/entities/PaymentApprovalRequestEntity';
import { Inject, Service } from 'typedi';

@Service()
export class PaymentApprovalRequestRepository {
    @Inject(type => DataMapper)
    mapper: DataMapper;
    
    async getPaymentApprovalRequestById(id: string): Promise<PaymentApprovalRequestEntity | null> {
        return this.mapper.get(Object.assign(new PaymentApprovalRequestEntity, { id: id })).then(fetched => {                
                return fetched;
            }).catch(err => {
                if (err.name === ItemNotFoundException.name) {
                    return null;
                }
                throw err;
            });
    }
    
    async savePaymentApprovalRequest(request: PaymentApprovalRequestEntity): Promise<PaymentApprovalRequestEntity> {
        request.updatedAt = new Date();
        const saved = await this.mapper.put(Object.assign(new PaymentApprovalRequestEntity, request));
        if (saved) {
            return saved;
        }

        throw new Error('Failed to persist');
    }
}