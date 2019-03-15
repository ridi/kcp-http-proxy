import * as Sentry from "@sentry/node";
import { Inject, Service } from "typedi";
import { Ascii, PayPlusStatus } from "../common/constants";
import { KcpComandActuator } from "../domain/KcpCommandActuator";
import { PaymentApprovalResult } from "../domain/result/PaymentApprovalResult";
import { PaymentApprovalResultType } from "../domain/result/PaymentApprovalResultType";
import { PaymentAuthKeyResult } from "../domain/result/PaymentAuthKeyResult";
import { PaymentAuthKeyResultType } from "../domain/result/PaymentAuthKeyResultType";
import { PaymentCancellationResult } from "../domain/result/PaymentCancellationResult";
import { PaymentCancellationResultType } from "../domain/result/PaymentCancellationResultType";
import { PaymentRequestAspect } from "./aop/PaymentRequestAspect";
import { AuthKeyRequestCommand } from "./command/AuthKeyRequestCommand";
import { Command } from "./command/Command";
import { CommandType } from "./command/CommandType";
import { PaymentApprovalCommand } from "./command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "./command/PaymentCancellationCommand";
import { InvalidCommandException } from "./exception/InvalidCommandException";
import { PayPlusException } from "./exception/PayPlusException";
import { IKcpAppService } from "./IKcpAppService";

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