
import { AbstractCommand } from '@root/application/commands/AbstractCommand';
import { PaymentApprovalCommand } from '@root/application/commands/PaymentApprovalCommand';
import { PaymentAuthKeyCommand } from '@root/application/commands/PaymentAuthKeyCommand';
import { PaymentCancellationCommand } from '@root/application/commands/PaymentCancellationCommand';
import { PaymentApprovalResult, PaymentApprovalResultType } from '@root/application/domain/PaymentApprovalResult';
import { PaymentAuthKeyResult, PaymentAuthKeyResultType } from '@root/application/domain/PaymentAuthKeyResult';
import { PaymentCancellationResult, PaymentCancellationResultType } from '@root/application/domain/PaymentCancellationResult';
import { KcpComandActuator } from '@root/application/kcp/KcpCommandActuator';
import { PaymentRequestAspect } from '@root/application/services/PaymentRequestAspect';
import { Ascii, PayPlusStatus } from '@root/common/constants';
import { InvalidCommandError } from '@root/errors/InvalidCommandError';
import { PayPlusError } from '@root/errors/PayPlusError';
import * as Sentry from '@sentry/node';
import { Inject, Service } from 'typedi';

@Service()
export class KcpAppService {
    @Inject()
    commandActuator: KcpComandActuator;

    @Inject('sentry.loggable')
    sentryLoggable: boolean;

    async requestAuthKey(command: PaymentAuthKeyCommand): Promise<PaymentAuthKeyResult> {
        return await this.executeCommand(command) as PaymentAuthKeyResult;
    }

    async approvePayment(command: PaymentApprovalCommand): Promise<PaymentApprovalResult> {
        return await this.executeCommand(command) as PaymentApprovalResult;
    }

    async cancelPayment(command: PaymentCancellationCommand): Promise<PaymentCancellationResult> {
        return await this.executeCommand(command) as PaymentCancellationResult;
    }

    @PaymentRequestAspect
    private async executeCommand(command: AbstractCommand): Promise<PaymentAuthKeyResult | PaymentApprovalResult | PaymentCancellationResult> {
        return this.commandActuator.actuate(command)
            .then(output => {
                const outputObject = {};
                output.split(Ascii.UnitSeparator).map(keyValueString => {
                    const key_value: string[] = keyValueString.split('=');
                    outputObject[key_value[0]] = key_value[1];
                });

                if (outputObject['res_cd'] !== PayPlusStatus.OK) {
                    throw new PayPlusError(outputObject['res_cd'], outputObject['res_msg'], command);
                }

                switch (command.constructor) {
                    case PaymentAuthKeyCommand: {
                        return PaymentAuthKeyResult.parse(outputObject as PaymentAuthKeyResultType);
                    }
                    case PaymentApprovalCommand: {
                        return PaymentApprovalResult.parse(outputObject as PaymentApprovalResultType);
                    }
                    case PaymentCancellationCommand: {
                        return PaymentCancellationResult.parse(outputObject as PaymentCancellationResultType);
                    }
                    default: {
                        throw new InvalidCommandError(`Unknown Command Type: ${command.constructor.name}`);
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