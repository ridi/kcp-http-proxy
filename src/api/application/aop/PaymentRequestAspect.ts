import { NumberValue } from "@aws/dynamodb-auto-marshaller";
import * as hash from "object-hash";
import { Container } from "typedi";
import { PayPlusStatus } from "../../common/constants";
import { IPaymentRequestRepository } from "../../domain/entity/IPaymentRequestRepository";
import { PaymentRequestEntity } from "../../domain/entity/PaymentRequestEntity";
import { PaymentApprovalResult } from "../../domain/result/PaymentApprovalResult";
import { PaymentAuthKeyResult } from "../../domain/result/PaymentAuthKeyResult";
import { PaymentCancellationResult } from "../../domain/result/PaymentCancellationResult";
import { PaymentRequestRepository } from "../../infra/repository/PaymentRequestRepository";
import { AuthKeyRequestCommand } from "../command/AuthKeyRequestCommand";
import { Command } from "../command/Command";
import { CommandType } from "../command/CommandType";
import { PaymentApprovalCommand } from "../command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "../command/PaymentCancellationCommand";
import { InvalidCommandException } from "../exception/InvalidCommandException";

export const PaymentRequestAspect = (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalValue = descriptor.value;

    descriptor.value = async function(command: Command) {
        return await PaymentRequestInvoker.invoke(command, originalValue, this);
    }
};

class PaymentRequestInvoker {    
    static async invoke(command: Command, fn: any, context: any): Promise<any> {
        const hashId = this.hashId(command);

        const repository = Container.get(PaymentRequestRepository);

        let found: PaymentRequestEntity = await this.getPaymentRequestEntity(repository, hashId);
        let result = this.findSuccessfulResult(command, found);
        if (result) {
            return result;
        }

        if (!found.results) {
            found.results = [];
        }
        result = await fn.apply(context, [command]);
        found.results.push(result);
        await repository.savePaymentRequest(found);
        return result;
    }

    static findSuccessfulResult(command: Command, found: PaymentRequestEntity): any {
        if (found.results) {
            const result = found.results.find(r => r.code === PayPlusStatus.OK);
            if (result) {
                return this.unmarshallResult(result);
            }
        }
        return null;
    }

    static unmarshallResult(result: any): any {
        const keys = Object.keys(result);
        for (const key of keys) {
            if (result[key] instanceof NumberValue) {
                result[key] = (result[key] as NumberValue).valueOf();
            }
        }
        return result;
    }

    static async getPaymentRequestEntity(repository: IPaymentRequestRepository, id: string): Promise<PaymentRequestEntity> {
        let found: PaymentRequestEntity | null = await repository.getPaymentRequestById(id);
        if (!found) {
            const request = new PaymentRequestEntity();
            request.id = id;
            found = await repository.savePaymentRequest(request);
            found.results = [];
        }
        return found;
    }

    static hashId(command: Command): string {
        switch (command.constructor) {
            case AuthKeyRequestCommand: {
                const cmd = command as AuthKeyRequestCommand;
                return hash({
                    command_type: cmd.type,
                    mode: cmd.mode,
                    card_number: cmd.card_number,
                    card_expiry_date: cmd.card_expiry_date,
                    card_tax_no: cmd.card_tax_no,
                    card_password: cmd.card_password
                });
            }
            case PaymentApprovalCommand: {
                const cmd = command as PaymentApprovalCommand;
                return hash({
                    command_type: cmd.type,
                    mode: cmd.mode,
                    bill_key: cmd.batch_key,
                    order_no: cmd.order_id,
                    product_amount: cmd.goods_price
                });
            }
            case PaymentCancellationCommand: {
                const cmd = command as PaymentCancellationCommand;
                return hash({
                    command_type: cmd.type,
                    mode: cmd.mode,
                    tno: cmd.tno
                });
            }
            default: {
                throw new InvalidCommandException(`Unknown Command Type: ${command.constructor}`);
            }
        }
    }
}
