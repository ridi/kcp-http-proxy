import { PaymentRequestAspect } from "@app/application/aop/PaymentRequestAspect";
import { AuthKeyRequestCommand } from "@app/application/command/AuthKeyRequestCommand";
import { Command } from "@app/application/command/Command";
import { CommandType } from "@app/application/command/CommandType";
import { PaymentApprovalCommand } from "@app/application/command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "@app/application/command/PaymentCancellationCommand";
import { InvalidCommandException } from "@app/application/exception/InvalidCommandException";
import { PayPlusException } from "@app/application/exception/PayPlusException";
import { IKcpAppService } from "@app/application/IKcpAppService";
import { Ascii, PayPlusStatus } from "@app/common/constants";
import { KcpComandActuator } from "@app/domain/KcpCommandActuator";
import { PaymentApprovalResult } from "@app/domain/result/PaymentApprovalResult";
import { PaymentApprovalResultType } from "@app/domain/result/PaymentApprovalResultType";
import { PaymentAuthKeyResult } from "@app/domain/result/PaymentAuthKeyResult";
import { PaymentAuthKeyResultType } from "@app/domain/result/PaymentAuthKeyResultType";
import { PaymentCancellationResult } from "@app/domain/result/PaymentCancellationResult";
import { PaymentCancellationResultType } from "@app/domain/result/PaymentCancellationResultType";
import * as Sentry from "@sentry/node";
import { Inject, Service } from "typedi";

@Service()
export class KcpAppService implements IKcpAppService {
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
                    throw new PayPlusException(outputObject["res_cd"], outputObject["res_msg"] + "\ncommand: " + JSON.stringify(command));
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