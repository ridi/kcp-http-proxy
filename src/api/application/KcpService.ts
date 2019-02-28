import * as Sentry from "@sentry/node";
import { Inject, Service } from 'typedi';
import { Ascii, PayPlusStatus } from '../common/constants';
import { KcpComandActuator } from '../domain/KcpCommandActuator';
import { AuthKeyRequestCommand } from "./command/AuthKeyRequestCommand";
import { Command } from "./command/Command";
import { CommandType } from "./command/CommandType";
import { PaymentApprovalCommand } from "./command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "./command/PaymentCancellationCommand";
import { InvalidCommandException } from './exception/InvalidCommandException';
import { PayPlusException } from './exception/PayPlusException';
import { AuthKeyRequestOutput, AuthKeyRequestResult } from './result/AuthKeyRequestResult';
import { PaymentApprovalOutput, PaymentApprovalResult } from './result/PaymentApprovalResult';
import { PaymentCancellationOutput, PaymentCancellationResult } from './result/PaymentCancellationResult';
import { PaymentRequestService } from "./PaymentRequestService";

@Service()
export class KcpService {
    @Inject()
    commandActuator: KcpComandActuator;

    @Inject()
    requestService: PaymentRequestService;

    @Inject("sentry.loggable")
    sentryLoggable: boolean;

    async requestAuthKey(command: AuthKeyRequestCommand): Promise<AuthKeyRequestResult> {
        return this.executeCommand(command);
    }

    async approvePayment(command: PaymentApprovalCommand): Promise<PaymentApprovalResult> {
        // check request log for preventing duplicate payment approval
        const found: PaymentApprovalResult | null = await this.requestService.findApprovalResult(command.batch_key, command.order_id, command.goods_price);
        if (found) {
            return found;
        }

        // save request log
        const reqLogId: number = await this.requestService.saveRequetLog(command.batch_key, command.order_id, command.goods_price);

        // payment approval
        const result: PaymentApprovalResult = await this.executeCommand(command);

        // save log
        await this.requestService.addResultToRequestLog(reqLogId, result);

        return result;
    }

    async cancelPayment(command: PaymentCancellationCommand): Promise<PaymentCancellationResult> {
        return this.executeCommand(command);
    }

    private executeCommand(command: Command): Promise<any> {
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
                    case CommandType.AUTH_KEY_REQ: {
                        return new AuthKeyRequestResult(outputObject as AuthKeyRequestOutput);
                    }
                    case CommandType.PAY_REQ: {
                        return new PaymentApprovalResult(outputObject as PaymentApprovalOutput);
                    }
                    case CommandType.PAY_CANCEL: {
                        return new PaymentCancellationResult(outputObject as PaymentCancellationOutput);
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