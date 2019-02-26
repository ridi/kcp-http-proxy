//import * as Raven from "raven";
import * as Logger from "bunyan";
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

@Service()
export class KcpService {
    @Inject("logger")
    logger: Logger;

    @Inject()
    commandActuator: KcpComandActuator;

    requestAuthKey(command: AuthKeyRequestCommand): Promise<AuthKeyRequestResult> {
        return this.executeCommand(command);
    }

    approvePayment(command: PaymentApprovalCommand): Promise<PaymentApprovalResult> {
        return this.executeCommand(command);
    }

    cancelPayment(command: PaymentCancellationCommand): Promise<PaymentCancellationResult> {
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
                    throw new PayPlusException(outputObject["res_cd"], outputObject["res_msg"]);
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
                this.logger.error('KcpService.executeCommand', error);
                //TODO logging sentry
                //Raven.captureException(error);
                return error;
            });
    }
}