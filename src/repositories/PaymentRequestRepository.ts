import { DataMapper, ItemNotFoundException } from "@aws/dynamodb-data-mapper";
import { PaymentRequestEntity } from "@root/domain/entity/PaymentRequestEntity";
import { Inject, Service } from "typedi";

@Service()
export class PaymentRequestRepository {
    @Inject(type => DataMapper)
    mapper: DataMapper;
    
    async getPaymentRequestById(id: string): Promise<PaymentRequestEntity | null> {
        return this.mapper.get(Object.assign(new PaymentRequestEntity, { id: id })).then(fetched => {                
                return fetched;
            }).catch(err => {
                if (err.name == ItemNotFoundException.name) {
                    return null;
                }
                throw err;
            });
    }
    
    async savePaymentRequest(request: PaymentRequestEntity): Promise<PaymentRequestEntity | null> {
        request.updated_at = new Date();
        const saved = await this.mapper.put(Object.assign(new PaymentRequestEntity, request));
        if (saved) {
            return saved;
        }

        throw "Failed to persist";
    }
}