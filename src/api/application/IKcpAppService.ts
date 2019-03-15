import { AuthKeyRequestCommand } from "@app/application/command/AuthKeyRequestCommand";
import { PaymentApprovalCommand } from "@app/application/command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "@app/application/command/PaymentCancellationCommand";
import { PaymentApprovalResult } from "@app/domain/result/PaymentApprovalResult";
import { PaymentAuthKeyResult } from "@app/domain/result/PaymentAuthKeyResult";
import { PaymentCancellationResult } from "@app/domain/result/PaymentCancellationResult";

export interface IKcpAppService {
    requestAuthKey(command: AuthKeyRequestCommand): Promise<PaymentAuthKeyResult>;

    approvePayment(command: PaymentApprovalCommand): Promise<PaymentApprovalResult>;

    cancelPayment(command: PaymentCancellationCommand): Promise<PaymentCancellationResult>;
}