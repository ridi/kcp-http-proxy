import * as hash from "object-hash";
import Container from "typedi";
import { AuthKeyRequestCommand } from "../command/AuthKeyRequestCommand";
import { Command } from "../command/Command";
import { CommandType } from "../command/CommandType";
import { PaymentApprovalCommand } from "../command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "../command/PaymentCancellationCommand";
import { InvalidCommandException } from "../exception/InvalidCommandException";
import { PayPlusStatus } from "../../common/constants";
import { PaymentApprovalResultEntity } from "../../domain/entity/PaymentApprovalResultEntity";
import { PaymentAuthKeyResultEntity } from "../../domain/entity/PaymentAuthKeyResultEntity";
import { PaymentCancellationResultEntity } from "../../domain/entity/PaymentCancellationResultEntity";
import { PaymentRequestEntity } from "../../domain/entity/PaymentRequestEntity";
import { TypeOrmPaymentRequestRepository } from "../../infra/repository/TypeOrmPaymentRequestRepository";

export const PaymentRequestAspect = (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalValue = descriptor.value;

    descriptor.value = async (command: Command) => {
        const hashed = Invoker.getHashKey(command);

        const repository = Container.get(TypeOrmPaymentRequestRepository);
        let found: PaymentRequestEntity = await Invoker.getPaymentRequestEntity(repository, command, hashed);
        let result = Invoker.getSuccessfulResult(command, found);
        if (result) {
            return result;
        }

        if (!found.auth_key_results) {
            found.auth_key_results = [];
        }
        if (!found.approval_results) {
            found.approval_results = [];
        }
        if (!found.cancel_results) {
            found.cancel_results = [];
        }
console.info("LINE", 38);
        const resultEntity = await originalValue.apply(this, [command]);
console.info("LINE", 40);
        switch(command.type) {
            case CommandType.REQUEST_AUTH_KEY: {
                found.auth_key_results.push(resultEntity);
                break;
            }
            case CommandType.PAYMENT_APPROVAL: {
                found.approval_results.push(resultEntity);
                break;
            }
            case CommandType.PAYMENT_CANCELLATION: {
                found.cancel_results.push(resultEntity);
                break;
            }
        }
console.info("LINE", 55);       
        await repository.savePaymentRequest(found);
console.info("LINE", 57);       
        return resultEntity;


        //return Invoker.invoke(command, originalValue, this);
    }
};

class Invoker {    
    static async invoke(command: Command, fn: any, context: any): Promise<any> {
        const hashed = Invoker.getHashKey(command);

        const repository = Container.get(TypeOrmPaymentRequestRepository);
        let found: PaymentRequestEntity = await Invoker.getPaymentRequestEntity(repository, command, hashed);
        let result = Invoker.getSuccessfulResult(command, found);
        if (result) {
            return result;
        }

        if (!found.auth_key_results) {
            found.auth_key_results = [];
        }
        if (!found.approval_results) {
            found.approval_results = [];
        }
        if (!found.cancel_results) {
            found.cancel_results = [];
        }

        const resultEntity = await fn.apply(context, [command]);
        switch(command.type) {
            case CommandType.REQUEST_AUTH_KEY: {
                found.auth_key_results.push(resultEntity);
                break;
            }
            case CommandType.PAYMENT_APPROVAL: {
                found.approval_results.push(resultEntity);
                break;
            }
            case CommandType.PAYMENT_CANCELLATION: {
                found.cancel_results.push(resultEntity);
                break;
            }
        }
        await repository.savePaymentRequest(found);
        return resultEntity;
    }

    static getSuccessfulResult(command: Command, found: PaymentRequestEntity): PaymentAuthKeyResultEntity | PaymentApprovalResultEntity | PaymentCancellationResultEntity | undefined {
        let result: PaymentAuthKeyResultEntity | PaymentApprovalResultEntity | PaymentCancellationResultEntity | undefined;
        switch (command.type) {
            case CommandType.REQUEST_AUTH_KEY: {
                if (found.auth_key_results) {
                    result = found.cancel_results.find(r => r.code === PayPlusStatus.OK);
                }
                break;
            }
            case CommandType.PAYMENT_APPROVAL: {
                if (found.approval_results) {
                    result = found.cancel_results.find(r => r.code === PayPlusStatus.OK);
                }
                break;
            }
            case CommandType.PAYMENT_CANCELLATION: {
                if (found.cancel_results) {
                    result = found.cancel_results.find(r => r.code === PayPlusStatus.OK);
                }
                break;
            }
        }
        return result;
    }

    static async getPaymentRequestEntity(repository:TypeOrmPaymentRequestRepository, command: Command, hashed: string): Promise<PaymentRequestEntity> {
        let found: PaymentRequestEntity | undefined = await repository.getPaymentRequest(command.type, command.mode, hashed);
        if (!found) {
            const request = new PaymentRequestEntity();
            request.command_type = command.type;
            request.mode = command.mode;
            request.hash = hashed;
            found = await repository.savePaymentRequest(request);
        }
        return found;
    }

    static getHashKey(command: Command): string {
        switch (command.constructor) {
            case AuthKeyRequestCommand: {
                const cmd = command as AuthKeyRequestCommand;
                return hash({
                    card_number: cmd.card_number,
                    card_expiry_date: cmd.card_expiry_date,
                    card_tax_no: cmd.card_tax_no,
                    card_password: cmd.card_password
                });
            }
            case PaymentApprovalCommand: {
                const cmd = command as PaymentApprovalCommand;
                return hash({
                    bill_key: cmd.batch_key,
                    order_no: cmd.order_id,
                    product_amount: cmd.goods_price
                });
            }
            case PaymentCancellationCommand: {
                return hash({ tno: (command as PaymentCancellationCommand).tno });
            }
            default: {
                throw new InvalidCommandException(`Unknown Command Type: ${command.constructor}`);
            }
        }
    }
}