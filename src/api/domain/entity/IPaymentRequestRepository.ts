import { CommandType } from "../../application/command/CommandType";
import { Mode } from "../../common/config";
import { PaymentRequestEntity } from "../../domain/entity/PaymentRequestEntity";

export interface IPaymentRequestRepository {
    getPaymentRequestById(id: string): Promise<PaymentRequestEntity | null>;

    getPaymentRequest(commandType: CommandType, mode: Mode, key: string): Promise<PaymentRequestEntity | null>;

    savePaymentRequest(request: PaymentRequestEntity): Promise<PaymentRequestEntity | null>;
}