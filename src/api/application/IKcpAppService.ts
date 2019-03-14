import { AuthKeyRequestCommand } from "./command/AuthKeyRequestCommand";
import { PaymentApprovalCommand } from "./command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "./command/PaymentCancellationCommand";
import { PaymentApprovalResult } from "../domain/result/PaymentApprovalResult";
import { PaymentAuthKeyResult } from "../domain/result/PaymentAuthKeyResult";
import { PaymentCancellationResult } from "../domain/result/PaymentCancellationResult";

export interface IKcpAppService {
    requestAuthKey(command: AuthKeyRequestCommand): Promise<PaymentAuthKeyResult>;

    approvePayment(command: PaymentApprovalCommand): Promise<PaymentApprovalResult>;

    cancelPayment(command: PaymentCancellationCommand): Promise<PaymentCancellationResult>;
}