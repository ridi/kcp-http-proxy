import { IPaymentRequestRepository } from "@/domain/entity/IPaymentRequestRepository";
import { PaymentRequestRepository } from "@/infra/repository/PaymentRequestRepository";
import * as Sentry from "@sentry/node";
import * as hash from "object-hash";
import { Container, Inject, Service } from "typedi";
import { Ascii, PayPlusStatus } from "../common/constants";
import { PaymentRequestEntity } from "../domain/entity/PaymentRequestEntity";
import { KcpComandActuator } from "../domain/KcpCommandActuator";
import { PaymentApprovalResult } from "../domain/result/PaymentApprovalResult";
import { PaymentApprovalResultType } from "../domain/result/PaymentApprovalResultType";
import { PaymentAuthKeyResult } from "../domain/result/PaymentAuthKeyResult";
import { PaymentAuthKeyResultType } from "../domain/result/PaymentAuthKeyResultType";
import { PaymentCancellationResult } from "../domain/result/PaymentCancellationResult";
import { PaymentCancellationResultType } from "../domain/result/PaymentCancellationResultType";
import { AuthKeyRequestCommand } from "./command/AuthKeyRequestCommand";
import { Command } from "./command/Command";
import { CommandType } from "./command/CommandType";
import { PaymentApprovalCommand } from "./command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "./command/PaymentCancellationCommand";
import { InvalidCommandException } from "./exception/InvalidCommandException";
import { PayPlusException } from "./exception/PayPlusException";
import { IKcpAppService } from "./IKcpAppService";

const PaymentRequestAspect = (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalValue = descriptor.value;

    descriptor.value = async function(command: Command) {
        const key = Invoker.getHashedKey(command);

        const repository = Container.get(PaymentRequestRepository);

        let found: PaymentRequestEntity = await Invoker.getPaymentRequestEntity(repository, command, key);
        let result = Invoker.getSuccessfulResult(command, found);
        if (result) {
            return result;
        }

        if (!found.results) {
            found.results = [];
        }
console.info("LINE", 38);
        result = await originalValue.apply(this, [command]);
console.info("\n\nLIN\n resultentityE", 40, result);
        found.results.push(result);
        await repository.savePaymentRequest(found);
console.info("LINE", 57);
        return result;
        //return Invoker.invoke(command, originalValue, this);
    }
};

class Invoker {    
    // static async invoke(command: Command, fn: any, context: any): Promise<any> {
    //     const hashed = Invoker.getHashKey(command);

    //     const repository = Container.get(TypeOrmPaymentRequestRepository);
    //     let found: PaymentRequestEntity = await Invoker.getPaymentRequestEntity(repository, command, hashed);
    //     let result = Invoker.getSuccessfulResult(command, found);
        
    //     if (result) {
    //         return result;
    //     }

    //     if (!found.auth_key_results) {
    //         found.auth_key_results = [];
    //     }
    //     if (!found.approval_results) {
    //         found.approval_results = [];
    //     }
    //     if (!found.cancel_results) {
    //         found.cancel_results = [];
    //     }

    //     const resultEntity = await fn.apply(context, [command]);
    //     switch(command.type) {
    //         case CommandType.REQUEST_AUTH_KEY: {
    //             found.auth_key_results.push(resultEntity);
    //             break;
    //         }
    //         case CommandType.PAYMENT_APPROVAL: {
    //             found.approval_results.push(resultEntity);
    //             break;
    //         }
    //         case CommandType.PAYMENT_CANCELLATION: {
    //             found.cancel_results.push(resultEntity);
    //             break;
    //         }
    //     }
    //     await repository.savePaymentRequest(found);
    //     return resultEntity;
    // }

    static getSuccessfulResult(command: Command, found: PaymentRequestEntity): PaymentAuthKeyResult | PaymentApprovalResult | PaymentCancellationResult | null {
        if (found.results) {
            const result = found.results.find(r => r.code === PayPlusStatus.OK);
            if (result) {
                switch(command.type) {
                    case CommandType.REQUEST_AUTH_KEY: {
                        return result as PaymentAuthKeyResult;
                    }
                    case CommandType.PAYMENT_APPROVAL: {
                        return result as PaymentApprovalResult;
                    }
                    case CommandType.PAYMENT_CANCELLATION: {
                        return result as PaymentAuthKeyResult;
                    }
                }
            }
        }
        return null;
    }

    static async getPaymentRequestEntity(repository: IPaymentRequestRepository, command: Command, key: string): Promise<PaymentRequestEntity> {
        let found: PaymentRequestEntity | undefined = await repository.getPaymentRequest(command.type, command.mode, key);
        if (!found) {
            const request = new PaymentRequestEntity();
            request.command_type = command.type;
            request.mode = command.mode;
            request.key = key;
            found = await repository.savePaymentRequest(request);
        }
        return found;
    }

    static getHashedKey(command: Command): string {
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