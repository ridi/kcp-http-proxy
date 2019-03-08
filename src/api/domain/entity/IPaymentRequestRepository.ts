import { PaymentRequestEntity } from "./PaymentRequestEntity";
import { CommandType } from "../../application/command/CommandType";

export interface IPaymentRequestRepository {
    getPaymentRequestById(id: number): Promise<PaymentRequestEntity | undefined>;

    getPaymentRequest(command_type: CommandType, hash: string): Promise<PaymentRequestEntity | undefined>;

    savePaymentRequest(request: PaymentRequestEntity): Promise<PaymentRequestEntity>;
}