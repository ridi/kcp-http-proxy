import * as Sentry from "@sentry/node";
import { Inject, Service } from "typedi";
import { PaymentRequestAspect } from "/application/aop/PaymentRequestAspect";
import { AuthKeyRequestCommand } from "/application/command/AuthKeyRequestCommand";
import { Command } from "/application/command/Command";
import { CommandType } from "/application/command/CommandType";
import { PaymentApprovalCommand } from "/application/command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "/application/command/PaymentCancellationCommand";
import { PaymentApprovalResultDto } from "/application/dto/PaymentApprovalResultDto";
import { PaymentAuthKeyResultDto } from "/application/dto/PaymentAuthKeyResultDto";
import { PaymentCancellationResultDto } from "/application/dto/PaymentCancellationResultDto";
import { InvalidCommandException } from "/application/exception/InvalidCommandException";
import { PayPlusException } from "/application/exception/PayPlusException";
import { IKcpAppService } from "/application/IKcpAppService";
import { Ascii, PayPlusStatus } from "/common/constants";
import { PaymentApprovalResultEntity } from "/domain/entity/PaymentApprovalResultEntity";
import { PaymentAuthKeyResultEntity } from "/domain/entity/PaymentAuthKeyResultEntity";
import { PaymentCancellationResultEntity } from "/domain/entity/PaymentCancellationResultEntity";
import { KcpComandActuator } from "/domain/KcpCommandActuator";
import { PaymentApprovalResultType } from "/domain/result/PaymentApprovalResultType";
import { PaymentAuthKeyResultType } from "/domain/result/PaymentAuthKeyResultType";
import { PaymentCancellationResultType } from "/domain/result/PaymentCancellationResultType";
import { PaymentRequestService } from "/domain/service/PaymentRequestService";

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