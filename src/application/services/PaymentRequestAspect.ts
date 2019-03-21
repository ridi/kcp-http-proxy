import { AbstractCommand } from '@root/application/commands/AbstractCommand';
import { PaymentApprovalCommand } from '@root/application/commands/PaymentApprovalCommand';
import { PaymentAuthKeyCommand } from '@root/application/commands/PaymentAuthKeyCommand';
import { PaymentCancellationCommand } from '@root/application/commands/PaymentCancellationCommand';
import { PaymentRequestEntity } from '@root/application/domain/PaymentRequestEntity';
import { PayPlusStatus } from '@root/common/constants';
import { InvalidCommandError } from '@root/errors/InvalidCommandError';
import { PaymentRequestRepository } from '@root/repositories/PaymentRequestRepository';
import * as hash from 'object-hash';
import { Container } from 'typedi';

export const PaymentRequestAspect = (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalValue = descriptor.value;

    descriptor.value = async function(command: AbstractCommand) {
        return await PaymentRequestInvoker.invoke(command, originalValue, this);
    }
};

class PaymentRequestInvoker {
    static async invoke(command: AbstractCommand, fn: any, context: any): Promise<any> {
        const hashId = this.hashId(command);

        const repository = Container.get(PaymentRequestRepository);

        let found: PaymentRequestEntity = await this.getPaymentRequestEntity(repository, hashId);
        let result = this.findSuccessfulResult(command, found);
        if (result) {
            delete result.created_at;
            return result;
        }

        result = await fn.apply(context, [command]);
        
        let results = [];
        switch (command.constructor) {
            case PaymentAuthKeyCommand:
                results = found.auth_key_results;
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

    static findSuccessfulResult(command: AbstractCommand, found: PaymentRequestEntity): any {
        let results = [];
        switch (command.constructor) {
            case PaymentAuthKeyCommand:
                results = found.auth_key_results;
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

    static async getPaymentRequestEntity(repository: PaymentRequestRepository, id: string): Promise<PaymentRequestEntity> {
        let found: PaymentRequestEntity | null = await repository.getPaymentRequestById(id);
        if (!found) {
            const request = new PaymentRequestEntity();
            request.id = id;
            found = await repository.savePaymentRequest(request);
            
        }
        if (!found.auth_key_results) {
            found.auth_key_results = [];
        }
        if (!found.approval_results) {
            found.approval_results = [];
        }
        if (!found.cancellation_results) {
            found.cancellation_results = [];
        }
        return found;
    }

    static hashId(command: AbstractCommand): string {
        switch (command.constructor) {
            case PaymentAuthKeyCommand: {
                const cmd = command as PaymentAuthKeyCommand;
                return hash({
                    site_code: cmd.config.siteCode,
                    card_number: cmd.card_number,
                    card_expiry_date: cmd.card_expiry_date,
                    card_tax_no: cmd.card_tax_no,
                    card_password: cmd.card_password
                });
            }
            case PaymentApprovalCommand: {
                const cmd = command as PaymentApprovalCommand;
                return hash({
                    site_code: cmd.config.siteCode,
                    bill_key: cmd.batch_key,
                    order_no: cmd.order_id,
                    product_amount: cmd.goods_price
                });
            }
            case PaymentCancellationCommand: {
                const cmd = command as PaymentCancellationCommand;
                return hash({
                    site_code: cmd.config.siteCode,
                    tno: cmd.tno
                });
            }
            default: {
                throw new InvalidCommandError(`Unknown Command: ${command.constructor}`);
            }
        }
    }
}
