import { CommandType } from "/application/command/CommandType";
import { PaymentRequestEntity } from "/domain/entity/PaymentRequestEntity";

export interface IPaymentRequestRepository {
    getPaymentRequestById(id: number): Promise<PaymentRequestEntity | undefined>;

    getPaymentRequest(command_type: CommandType, hash: string): Promise<PaymentRequestEntity | undefined>;

    savePaymentRequest(request: PaymentRequestEntity): Promise<PaymentRequestEntity>;
}