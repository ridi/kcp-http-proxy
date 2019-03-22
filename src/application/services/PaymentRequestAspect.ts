import { KcpConfig, KcpSite } from '@root/common/config';
import { PayPlusStatus } from '@root/common/constants';
import { AbstractKcpCommand } from '@root/domain/commands/AbstractKcpCommand';
import { PaymentApprovalCommand } from '@root/domain/commands/PaymentApprovalCommand';
import { PaymentBatchKeyCommand } from '@root/domain/commands/PaymentBatchKeyCommand';
import { PaymentCancellationCommand } from '@root/domain/commands/PaymentCancellationCommand';
import { PaymentRequest } from '@root/domain/entities/PaymentRequest';
import { InvalidRequestError } from '@root/errors/InvalidRequestError';
import { PaymentRequestRepository } from '@root/domain/entities/PaymentRequestRepository';
import * as hash from 'object-hash';
import { Container } from 'typedi';

export const PaymentRequestAspect = (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalValue = descriptor.value;

    descriptor.value = async function(command: AbstractKcpCommand) {
        return await PaymentRequestInvoker.invoke(command, originalValue, this);
    }
};

class PaymentRequestInvoker {
    static async invoke(command: AbstractKcpCommand, fn: any, context: any): Promise<any> {
        const hashId = this.hashId(command);

        const repository = Container.get(PaymentRequestRepository);

        let found: PaymentRequest = await this.getPaymentRequestEntity(repository, hashId);
        let result = this.findSuccessfulResult(command, found);
        if (result) {
            delete result.created_at;
            return result;
        }

        result = await fn.apply(context, [command]);
        
        let results = [];
        switch (command.constructor) {
            case PaymentBatchKeyCommand:
                results = found.batch_key_results;
                break;
            case PaymentApprovalCommand:
                results = found.approval_results;
                break;
            case PaymentCancellationCommand:
                results = found.cancellation_results;
                break;
        }
        results.push(result);

        await repository.savePaymentRequest(found);
        return result;
    }

    static findSuccessfulResult(command: AbstractKcpCommand, found: PaymentRequest): any {
        let results = [];
        switch (command.constructor) {
            case PaymentBatchKeyCommand:
                results = found.batch_key_results;
                break;
            case PaymentApprovalCommand:
                results = found.approval_results;
                break;
            case PaymentCancellationCommand:
                results = found.cancellation_results;
                break;
        }

        return results.find(r => r.code === PayPlusStatus.OK) || null;
    }

    static async getPaymentRequestEntity(repository: PaymentRequestRepository, id: string): Promise<PaymentRequest> {
        let found: PaymentRequest | null = await repository.getPaymentRequestById(id);
        if (!found) {
            const request = new PaymentRequest();
            request.id = id;
            found = await repository.savePaymentRequest(request);
        }
        if (!found.batch_key_results) {
            found.batch_key_results = [];
        }
        if (!found.approval_results) {
            found.approval_results = [];
        }
        if (!found.cancellation_results) {
            found.cancellation_results = [];
        }
        return found;
    }

    static hashId(command: AbstractKcpCommand): string {
        const config: KcpConfig = Container.get(KcpConfig);
        const site: KcpSite = config.site(command.isTaxDeductible);

        switch (command.constructor) {
            case PaymentBatchKeyCommand: {
                const cmd = command as PaymentBatchKeyCommand;
                return hash({
                    siteCode: site.code,
                    cardNumber: cmd.cardNumber,
                    cardExpiryDate: cmd.cardExpiryDate,
                    cardTaxNumber: cmd.cardTaxNumber,
                    cardPassword: cmd.cardPassword
                });
            }
            case PaymentApprovalCommand: {
                const cmd = command as PaymentApprovalCommand;
                return hash({
                    siteCode: site.code,
                    batchKey: cmd.batchKey,
                    orderNo: cmd.orderNo,
                    productAmount: cmd.productAmount
                });
            }
            case PaymentCancellationCommand: {
                const cmd = command as PaymentCancellationCommand;
                return hash({
                    siteCode: site.code,
                    tno: cmd.tno
                });
            }
            default: {
                console.error('Unknown Command', command);
                throw new InvalidRequestError();
            }
        }
    }
}
