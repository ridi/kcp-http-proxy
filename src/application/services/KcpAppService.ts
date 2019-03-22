
import { PaymentApprovalRequest } from '@root/application/requests/PaymentApprovalRequest';
import { PaymentBatchKeyRequest } from '@root/application/requests/PaymentBatchKeyRequest';
import { PaymentCancellationRequest } from '@root/application/requests/PaymentCancellationRequest';
import { PaymentRequestAspect } from '@root/application/services/PaymentRequestAspect';
import { Ascii, PayPlusStatus } from '@root/common/constants';
import { AbstractKcpCommand } from '@root/domain/commands/AbstractKcpCommand';
import { PaymentApprovalCommand } from '@root/domain/commands/PaymentApprovalCommand';
import { PaymentBatchKeyCommand } from '@root/domain/commands/PaymentBatchKeyCommand';
import { PaymentCancellationCommand } from '@root/domain/commands/PaymentCancellationCommand';
import { KcpComandActuator } from '@root/domain/kcp/KcpCommandActuator';
import { PaymentApprovalResult, PaymentApprovalResultType } from '@root/domain/entities/PaymentApprovalResult';
import { PaymentBatchKeyResult, PaymentBatchKeyResultType } from '@root/domain/entities/PaymentBatchKeyResult';
import { PaymentCancellationResult, PaymentCancellationResultType } from '@root/domain/entities/PaymentCancellationResult';
import { InvalidRequestError } from '@root/errors/InvalidRequestError';
import { PayPlusError } from '@root/errors/PayPlusError';
import * as Sentry from '@sentry/node';
import { Inject, Service } from 'typedi';

@Service()
export class KcpAppService {
    @Inject()
    commandActuator: KcpComandActuator;

    @Inject('sentry.loggable')
    sentryLoggable: boolean;

    async requestAuthKey(req: PaymentBatchKeyRequest): Promise<PaymentBatchKeyResult> {
        const command = new PaymentBatchKeyCommand(
            req.is_tax_deductible,
            req.card_no,
            req.card_expiry_date,
            req.card_tax_no,
            req.card_password
        );
        return await this.executeCommand(command) as PaymentBatchKeyResult;
    }

    async approvePayment(req: PaymentApprovalRequest): Promise<PaymentApprovalResult> {
        const command = new PaymentApprovalCommand(
            req.is_tax_deductible,
            req.batch_key,
            req.order_no,
            req.product_name,
            req.product_amount,
            req.buyer_name,
            req.buyer_email,
            '',
            '',
            req.installment_months
        );
        return await this.executeCommand(command) as PaymentApprovalResult;
    }

    async cancelPayment(req: PaymentCancellationRequest): Promise<PaymentCancellationResult> {
        const command = new PaymentCancellationCommand(req.is_tax_deductible, req.tno, req.reason);
        return await this.executeCommand(command) as PaymentCancellationResult;
    }

    @PaymentRequestAspect
    private async executeCommand(command: AbstractKcpCommand): Promise<PaymentBatchKeyResult | PaymentApprovalResult | PaymentCancellationResult> {
        return this.commandActuator.actuate(command)
            .then(output => {
                const outputObject = {};
                output.split(Ascii.UnitSeparator).map(keyValueString => {
                    const key_value: string[] = keyValueString.split('=');
                    outputObject[key_value[0]] = key_value[1];
                });

                if (outputObject['res_cd'] !== PayPlusStatus.OK) {
                    throw new PayPlusError(outputObject['res_cd'], outputObject['res_msg']);
                }

                switch (command.constructor) {
                    case PaymentBatchKeyCommand: {
                        return PaymentBatchKeyResult.parse(outputObject as PaymentBatchKeyResultType);
                    }
                    case PaymentApprovalCommand: {
                        return PaymentApprovalResult.parse(outputObject as PaymentApprovalResultType);
                    }
                    case PaymentCancellationCommand: {
                        return PaymentCancellationResult.parse(outputObject as PaymentCancellationResultType);
                    }
                    default: {
                        console.error('Unknown Command', command);                        
                        throw new InvalidRequestError();
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