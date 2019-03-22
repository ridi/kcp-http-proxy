import { DataMapper, ItemNotFoundException } from '@aws/dynamodb-data-mapper';
import { PaymentRequest } from '@root/domain/entities/PaymentRequest';
import { Inject, Service } from 'typedi';

@Service()
export class PaymentRequestRepository {
    @Inject(type => DataMapper)
    mapper: DataMapper;
    
    async getPaymentRequestById(id: string): Promise<PaymentRequest | null> {
        return this.mapper.get(Object.assign(new PaymentRequest, { id: id })).then(fetched => {                
                return fetched;
            }).catch(err => {
                if (err.name == ItemNotFoundException.name) {
                    return null;
                }
                throw err;
            });
    }
    
    async savePaymentRequest(request: PaymentRequest): Promise<PaymentRequest | null> {
        request.updated_at = new Date();
        const saved = await this.mapper.put(Object.assign(new PaymentRequest, request));
        if (saved) {
            return saved;
        }

        throw new Error('Failed to persist');
    }
}