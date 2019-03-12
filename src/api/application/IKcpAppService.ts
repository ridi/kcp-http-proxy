import { AuthKeyRequestCommand } from "./command/AuthKeyRequestCommand";
import { PaymentApprovalCommand } from "./command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "/application/command/PaymentCancellationCommand";
import { PaymentApprovalResultDto } from "/application/dto/PaymentApprovalResultDto";
import { PaymentAuthKeyResultDto } from "/application/dto/PaymentAuthKeyResultDto";
import { PaymentCancellationResultDto } from "/application/dto/PaymentCancellationResultDto";

export interface IKcpAppService {
    requestAuthKey(command: AuthKeyRequestCommand): Promise<PaymentAuthKeyResultDto>;

    approvePayment(command: PaymentApprovalCommand): Promise<PaymentApprovalResultDto>;

    cancelPayment(command: PaymentCancellationCommand): Promise<PaymentCancellationResultDto>;
}