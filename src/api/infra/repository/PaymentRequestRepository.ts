import { CommandType } from "@/application/command/CommandType";
import { Mode } from "@/common/config";
import { IPaymentRequestRepository } from "@/domain/entity/IPaymentRequestRepository";
import { PaymentRequestEntity } from "@/domain/entity/PaymentRequestEntity";
import { Inject, Service } from "typedi";
import { DataMapper } from "@aws/dynamodb-data-mapper";

@Service()
export class PaymentRequestRepository implements IPaymentRequestRepository {
    @Inject(type => DataMapper)
    mapper: DataMapper;
    
    async getPaymentRequestById(id: string): Promise<PaymentRequestEntity | null> {
        const toFetch = new PaymentRequestEntity();
        toFetch.id = id;
        const fetched = await this.mapper.get({ item: toFetch });
        if (fetched) {
            return fetched.item || null;
        }
        return null;
    }
    
    async getPaymentRequest(commandType: CommandType, mode: Mode, key: string): Promise<PaymentRequestEntity | null> {
        const toFetch = new PaymentRequestEntity();
        toFetch.command_type = commandType;
        toFetch.mode = mode;
        toFetch.key = key;
        const fetched = await this.mapper.get({ item: toFetch });
        if (fetched) {
            return fetched.item || null;
        }
        return null;
    }
    
    async savePaymentRequest(request: PaymentRequestEntity): Promise<PaymentRequestEntity | null> {
        request.updated_at = new Date();
        const saved = await this.mapper.put({ item: request });
        if (saved) {
            return saved.item || null;
        }
        return null;
    }
}