import { AuthKeyRequestCommand } from "./command/AuthKeyRequestCommand";
import { PaymentApprovalCommand } from "./command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "./command/PaymentCancellationCommand";
import { PaymentApprovalResultDto } from "./dto/PaymentApprovalResultDto";
import { PaymentAuthKeyResultDto } from "./dto/PaymentAuthKeyResultDto";
import { PaymentCancellationResultDto } from "./dto/PaymentCancellationResultDto";

export interface IKcpAppService {
    requestAuthKey(command: AuthKeyRequestCommand): Promise<PaymentAuthKeyResultDto>;

    approvePayment(command: PaymentApprovalCommand): Promise<PaymentApprovalResultDto>;

    cancelPayment(command: PaymentCancellationCommand): Promise<PaymentCancellationResultDto>;
}