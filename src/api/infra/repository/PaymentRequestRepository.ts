import { Marshaller } from "@aws/dynamodb-auto-marshaller";
import { DataMapper, ItemNotFoundException } from "@aws/dynamodb-data-mapper";
import { Inject, Service } from "typedi";
import { IPaymentRequestRepository } from "../../domain/entity/IPaymentRequestRepository";
import { PaymentRequestEntity } from "../../domain/entity/PaymentRequestEntity";

@Service()
export class PaymentRequestRepository implements IPaymentRequestRepository {
    @Inject(type => DataMapper)
    mapper: DataMapper;
    @Inject()
    marshaller: Marshaller;
    
    async getPaymentRequestById(id: string): Promise<PaymentRequestEntity | null> {
        const toFetch = new PaymentRequestEntity();
        toFetch.id = id;
        
        
        return this.mapper.get(Object.assign(new PaymentRequestEntity, { id: id })).then(fetched => {
                console.info("\nFetced:", fetched);
                return fetched;
            }).catch(err => {
                if (err.name == ItemNotFoundException.name) {
                    console.info("Not found....");
                    return null;
                }
                throw err;
            });
    }
    
    async savePaymentRequest(request: PaymentRequestEntity): Promise<PaymentRequestEntity | null> {
        request.updated_at = new Date();
        const saved = await this.mapper.put(Object.assign(new PaymentRequestEntity, request));
        if (saved) {
            console.info('\nSaved:', saved);
            return saved;
        }
        throw 'Failed to persist';
    }
}