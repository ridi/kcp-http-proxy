import { Mode } from "/common/config";
import { PaymentApprovalResultEntity } from "/domain/entity/PaymentApprovalResultEntity";
import { PaymentAuthKeyResultEntity } from "/domain/entity/PaymentAuthKeyResultEntity";
import { PaymentCancellationResultEntity } from "/domain/entity/PaymentCancellationResultEntity";
import { PaymentRequestEntity } from "/domain/entity/PaymentRequestEntity";

export interface IPaymentRequestService {
    getPaymentAuthKeyResult(mode: Mode, card_number: string, card_expiry_date: string, card_tax_no: string, card_password: string): Promise<PaymentAuthKeyResultEntity | null>;

    getPaymentApprovalResult(mode: Mode, bill_key: string, order_no: string, product_amount: number): Promise<PaymentApprovalResultEntity | null>;

    getPaymentCancellationResult(mode: Mode, tno: string): Promise<PaymentCancellationResultEntity | null>;

    saveResultToRequest(request: PaymentRequestEntity, result: PaymentAuthKeyResultEntity | PaymentApprovalResultEntity | PaymentCancellationResultEntity): Promise<PaymentRequestEntity>
}