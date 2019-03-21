import { AuthKeyRequestCommand, Command, CommandType, PaymentApprovalCommand, PaymentCancellationCommand } from "@root/application/commands";
import { InvalidCommandException, PayPlusException } from "@root/exception/exceptions";
import { PaymentRequestAspect } from "@root/application/services/PaymentRequestAspect";
import { Ascii, PayPlusStatus } from "@root/common/constants";
import * as Sentry from "@sentry/node";
import { Inject, Service } from "typedi";

@Service()
export class KcpAppService {
    @Inject()
    commandActuator: KcpComandActuator;

    @Inject("sentry.loggable")
    sentryLoggable: boolean;

    async requestAuthKey(command: AuthKeyRequestCommand): Promise<PaymentAuthKeyResult> {
        return await this.executeCommand(command) as PaymentAuthKeyResult;
    }

    async approvePayment(command: PaymentApprovalCommand): Promise<PaymentApprovalResult> {
        return await this.executeCommand(command) as PaymentApprovalResult;
    }

    async cancelPayment(command: PaymentCancellationCommand): Promise<PaymentCancellationResult> {
        return await this.executeCommand(command) as PaymentCancellationResult;
    }

    @PaymentRequestAspect
    private async executeCommand(command: Command): Promise<PaymentAuthKeyResult | PaymentApprovalResult | PaymentCancellationResult> {
        return this.commandActuator.actuate(command)
            .then(output => {
                const outputObject = {};
                output.split(Ascii.UnitSeparator).map(keyValueString => {
                    const key_value: string[] = keyValueString.split("=");
                    outputObject[key_value[0]] = key_value[1];
                });

                if (outputObject["res_cd"] !== PayPlusStatus.OK) {
                    throw new PayPlusException(outputObject["res_cd"], outputObject["res_msg"], command);
                }

                switch (command.type) {
                    case CommandType.REQUEST_AUTH_KEY: {
                        return PaymentAuthKeyResult.parse(outputObject as PaymentAuthKeyResultType);
                    }
                    case CommandType.PAYMENT_APPROVAL: {
                        return PaymentApprovalResult.parse(outputObject as PaymentApprovalResultType);
                    }
                    case CommandType.PAYMENT_CANCELLATION: {
                        return PaymentCancellationResult.parse(outputObject as PaymentCancellationResultType);
                    }
                    default: {
                        throw new InvalidCommandException(`Unknown Command Type: ${command.type}`);
                    }
                }
            }).catch(error => {
                if (this.sentryLoggable) {
                    Sentry.captureException(error);
                }
                throw error;
            });
    }
}