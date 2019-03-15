import { PaymentRequestEntity } from "@app/domain/entity/PaymentRequestEntity";

export interface IPaymentRequestRepository {
    getPaymentRequestById(id: string): Promise<PaymentRequestEntity | null>;

    savePaymentRequest(request: PaymentRequestEntity): Promise<PaymentRequestEntity | null>;
}