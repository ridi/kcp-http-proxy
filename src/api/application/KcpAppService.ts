import * as Sentry from "@sentry/node";
import { Inject, Service, Container } from "typedi";
import { AuthKeyRequestCommand } from "./command/AuthKeyRequestCommand";
import { Command } from "./command/Command";
import { CommandType } from "./command/CommandType";
import { PaymentApprovalCommand } from "./command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "./command/PaymentCancellationCommand";
import { PaymentApprovalResultDto } from "./dto/PaymentApprovalResultDto";
import { PaymentAuthKeyResultDto } from "./dto/PaymentAuthKeyResultDto";
import { PaymentCancellationResultDto } from "./dto/PaymentCancellationResultDto";
import { InvalidCommandException } from "./exception/InvalidCommandException";
import { PayPlusException } from "./exception/PayPlusException";
import { IKcpAppService } from "./IKcpAppService";
import { Ascii, PayPlusStatus } from "../common/constants";
import { PaymentApprovalResultEntity } from "../domain/entity/PaymentApprovalResultEntity";
import { PaymentAuthKeyResultEntity } from "../domain/entity/PaymentAuthKeyResultEntity";
import { PaymentCancellationResultEntity } from "../domain/entity/PaymentCancellationResultEntity";
import { KcpComandActuator } from "../domain/KcpCommandActuator";
import { PaymentApprovalResultType } from "../domain/result/PaymentApprovalResultType";
import { PaymentAuthKeyResultType } from "../domain/result/PaymentAuthKeyResultType";
import { PaymentCancellationResultType } from "../domain/result/PaymentCancellationResultType";
import { PaymentRequestService } from "../domain/service/PaymentRequestService";
import { TypeOrmPaymentRequestRepository } from "../infra/repository/TypeOrmPaymentRequestRepository";
import { PaymentRequestEntity } from "../domain/entity/PaymentRequestEntity";
import * as hash from "object-hash";

const PaymentRequestAspect = (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalValue = descriptor.value;

    descriptor.value = async function(command: Command) {
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
console.info("\n\nLIN\n resultentityE", 40, resultEntity);
        switch(command.type) {
            case CommandType.REQUEST_AUTH_KEY: {
                console.info("AUTH_KEY");
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
        
console.info("LINE", 55, "results size", found.auth_key_results.length);       
        await repository.savePaymentRequest(found);
console.info("LINE", 57);       
        return resultEntity;


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

    static getSuccessfulResult(command: Command, found: PaymentRequestEntity): PaymentAuthKeyResultEntity | PaymentApprovalResultEntity | PaymentCancellationResultEntity | undefined {
        let result: PaymentAuthKeyResultEntity | PaymentApprovalResultEntity | PaymentCancellationResultEntity | undefined;
        switch (command.type) {
            case CommandType.REQUEST_AUTH_KEY: {
                if (found.auth_key_results) {
                    result = found.auth_key_results.find(r => r.code === PayPlusStatus.OK);
                }
                break;
            }
            case CommandType.PAYMENT_APPROVAL: {
                if (found.approval_results) {
                    result = found.approval_results.find(r => r.code === PayPlusStatus.OK);
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

@Service()
export class KcpAppService implements IKcpAppService {
    @Inject()
    commandActuator: KcpComandActuator;

    @Inject()
    requestService: PaymentRequestService;

    @Inject("sentry.loggable")
    sentryLoggable: boolean;

    async requestAuthKey(command: AuthKeyRequestCommand): Promise<PaymentAuthKeyResultDto> {
        const entity: any = await this.executeCommand(command);
        const { id, created_at, ...rest } = entity as PaymentAuthKeyResultEntity;
        return Object.assign(new PaymentAuthKeyResultDto(), rest);
    }

    async approvePayment(command: PaymentApprovalCommand): Promise<PaymentApprovalResultDto> {
        const entity: any = await this.executeCommand(command);
        const { id, created_at, ...rest } = entity as PaymentApprovalResultEntity;
        return Object.assign(new PaymentApprovalResultDto(), rest);
    }

    async cancelPayment(command: PaymentCancellationCommand): Promise<PaymentCancellationResultDto> {
        const entity: any = await this.executeCommand(command);
        const { id, created_at, ...rest } = entity as PaymentCancellationResultEntity;
        return Object.assign(new PaymentCancellationResultDto(), rest);
    }

    @PaymentRequestAspect
    private executeCommand(command: Command): Promise<PaymentAuthKeyResultEntity | PaymentApprovalResultEntity | PaymentCancellationResultEntity> {
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
                        return PaymentAuthKeyResultEntity.parse(outputObject as PaymentAuthKeyResultType);
                    }
                    case CommandType.PAYMENT_APPROVAL: {
                        return PaymentApprovalResultEntity.parse(outputObject as PaymentApprovalResultType);
                    }
                    case CommandType.PAYMENT_CANCELLATION: {
                        return PaymentCancellationResultEntity.parse(outputObject as PaymentCancellationResultType);
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